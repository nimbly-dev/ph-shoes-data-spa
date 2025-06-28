package com.nimbly.phshoesbackend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbly.phshoesbackend.exception.AiSearchException;
import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.model.dto.FilterCriteria;
import com.nimbly.phshoesbackend.repository.EmbeddingFactProductShoesRepository;
import com.nimbly.phshoesbackend.repository.FactProductShoesRepository;
import com.nimbly.phshoesbackend.repository.specification.ProductShoesSpecifications;
import com.nimbly.phshoesbackend.service.FactProductShoesService;
import com.nimbly.phshoesbackend.service.OpenAiEmbeddingService;
import com.nimbly.phshoesbackend.service.OpenAiIntentParserService;
import com.nimbly.phshoesbackend.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
public class FactProductShoesServiceImpl implements FactProductShoesService {

    private final static int MAX_PAGE_SIZE = 2500;

    private final FactProductShoesRepository shoeRepo;
    private final EmbeddingFactProductShoesRepository embeddingRepo;
    private final OpenAiIntentParserService intentParser;
    private final OpenAiEmbeddingService embeddingService;
    private final FactProductShoesPaginateUtil paginateUtil;
    private final PreFilterExtractorUtils preExtractor;
    private final AiRetry aiRetry;
    private final ObjectMapper objectMapper;

    @Value("${ai-search.vector-enabled:true}")
    private boolean vectorEnabled;

    public FactProductShoesServiceImpl(
            FactProductShoesRepository shoeRepo,
            EmbeddingFactProductShoesRepository embeddingRepo,
            OpenAiIntentParserService intentParser,
            OpenAiEmbeddingService embeddingService,
            FactProductShoesPaginateUtil paginateUtil,
            ObjectMapper objectMapper,
            PreFilterExtractorUtils preExtractor,
            AiRetry aiRetry
    ) {
        this.shoeRepo                = shoeRepo;
        this.embeddingRepo           = embeddingRepo;
        this.intentParser            = intentParser;
        this.embeddingService        = embeddingService;
        this.paginateUtil            = paginateUtil;
        this.objectMapper            = objectMapper;
        this.preExtractor = preExtractor;
        this.aiRetry = aiRetry;
    }

    @Override
    public Page<FactProductShoes> fetchBySpec(Specification<FactProductShoes> spec, Pageable pageable) {
        int    safeSize   = Math.min(pageable.getPageSize(), MAX_PAGE_SIZE);
        Pageable safePg   = PageRequest.of(pageable.getPageNumber(), safeSize, pageable.getSort());
        return shoeRepo.findAll(spec, safePg);
    }

    @Override
    public List<FactProductShoesRepository.LatestData> getLatestDataByBrand() {
        return shoeRepo.findLatestDatePerBrand();
    }

    @Override
    @Transactional
    public Page<FactProductShoes> aiSearch(String nlQuery, Pageable pg) {
        log.info("Starting AI search for query='{}'", nlQuery);
        FilterCriteria baseCriteria = preExtractor.extract(nlQuery);
        String leftoverText = preExtractor.strip(nlQuery);
        log.trace("After strip: {}", nlQuery);

        FilterCriteria fuzzyCriteria = aiRetry.withRetry(() -> intentParser.parseIntent(leftoverText));
        log.info("FilterCriteria from GPT: {}", fuzzyCriteria);

        FilterCriteria mergedCriteria = merge(baseCriteria, fuzzyCriteria);
        FilterCriteriaNormalizer.normalize(mergedCriteria);
        validateFilterCriteria(mergedCriteria);
        log.info("Normalized FilterCriteria: {}", mergedCriteria);

        int safeSize = Math.min(pg.getPageSize(), MAX_PAGE_SIZE);
        Pageable safePageable = PageRequest.of(pg.getPageNumber(), safeSize, pg.getSort());

        if (mergedCriteria.getSortBy() != null) {
            return shoeRepo.findAll(buildSpec(mergedCriteria), safePageable);
        }

        Page<FactProductShoes> cappedPage =
                shoeRepo.findAll(buildSpec(mergedCriteria),
                        PageRequest.of(0, MAX_PAGE_SIZE, pg.getSort()));
        List<FactProductShoes> filteredList = cappedPage.getContent();

        if (!filteredList.isEmpty()) {
            log.trace("Fallback to vector search");
            float[] queryVector = aiRetry.withRetry(() -> embeddingService.embed(nlQuery));

            return paginateUtil.paginateByVectorScore(
                    filteredList,
                    queryVector,
                    safePageable,
                    embeddingRepo
            );
        }

        return fullCatalogVectorSearch(nlQuery, safePageable, mergedCriteria.getOnSale());
    }


    private boolean isPriceSort(FilterCriteria c, String q) {
        if ((c.getSortBy() == null || c.getSortBy().isBlank())
                && q.toLowerCase().contains("cheapest")) {
            c.setSortBy("price_asc");
        }
        return "price_asc".equalsIgnoreCase(c.getSortBy())
                || "price_desc".equalsIgnoreCase(c.getSortBy());
    }

    private Specification<FactProductShoes> buildSpec(FilterCriteria c) {
        return ProductShoesSpecifications.byFilters(
                c.getBrand(), c.getModel(), c.getGender(),
                c.getPriceSaleMin(), c.getPriceSaleMax(),
                c.getPriceOriginalMin(), c.getPriceOriginalMax(),
                c.getOnSale(),
                c.getTitleKeywords(), c.getSubtitleKeywords(),
                c.getSortBy()
        );
    }

    private Page<FactProductShoes> fullCatalogVectorSearch(
            String q, Pageable pg, boolean onSale
    ) {
        String json = VectorUtils.toJson(embeddingService.embed(q), objectMapper);

        List<FactProductShoes> results = onSale
                ? shoeRepo.findOnSaleByVector(json, pg)
                : shoeRepo.findAllByVector(json, pg);

        long total = onSale
                ? shoeRepo.countDistinctOnSaleProducts()
                : shoeRepo.countDistinctProducts();

        return new PageImpl<>(results, pg, total);
    }

    private FilterCriteria merge(FilterCriteria base, FilterCriteria fuzzy) {
        // deterministic fields win
        if (fuzzy.getModel() != null) base.setModel(fuzzy.getModel());
        base.setTitleKeywords(fuzzy.getTitleKeywords());
        return base;
    }

    private void validateFilterCriteria(FilterCriteria c) {
        if (c.getBrand() != null && !preExtractor.isKnownBrand(c.getBrand())) {
            log.warn("Unknown brand: {}" , c.getBrand());
            throw new AiSearchException("Unknown brand: " + c.getBrand(), null);
        }
        if (c.getPriceSaleMin() != null && c.getPriceSaleMin() < 0 ||
                c.getPriceSaleMax() != null && c.getPriceSaleMax() < 0) {
            log.warn("Negative priceSale filter");
            throw new AiSearchException("Negative priceSale filter", null);
        }
        if (c.getPriceSaleMin() != null && c.getPriceSaleMax() != null
                && c.getPriceSaleMin() > c.getPriceSaleMax()) {
            log.warn("priceSaleMin > priceSaleMax");
            throw new AiSearchException("priceSaleMin > priceSaleMax", null);
        }
        if (c.getSortBy() != null &&
                !Set.of("price_asc", "price_desc").contains(c.getSortBy())) {
            log.warn("Invalid sortBy: {}", c.getSortBy());
            throw new AiSearchException("Invalid sortBy: " + c.getSortBy(), null);
        }
        if (c.getGender() != null && !Set.of("male","female","unisex").contains(c.getGender())) {
            log.warn("Invalid gender: {}", c.getGender());
            throw new AiSearchException("Invalid gender: " + c.getGender(), null);
        }
        if (c.getTitleKeywords() == null)    c.setTitleKeywords(List.of());
        if (c.getSubtitleKeywords() == null) c.setSubtitleKeywords(List.of());
    }

}
