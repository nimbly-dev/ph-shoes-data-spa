package com.nimbly.phshoesbackend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.model.dto.FilterCriteria;
import com.nimbly.phshoesbackend.repository.EmbeddingFactProductShoesRepository;
import com.nimbly.phshoesbackend.repository.FactProductShoesRepository;
import com.nimbly.phshoesbackend.repository.specification.ProductShoesSpecifications;
import com.nimbly.phshoesbackend.service.FactProductShoesService;
import com.nimbly.phshoesbackend.service.OpenAiEmbeddingService;
import com.nimbly.phshoesbackend.service.OpenAiIntentParserService;
import com.nimbly.phshoesbackend.util.FactProductShoesPaginateUtil;
import com.nimbly.phshoesbackend.util.FilterCriteriaNormalizer;
import com.nimbly.phshoesbackend.util.PreFilterExtractorUtils;
import com.nimbly.phshoesbackend.util.VectorUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FactProductShoesServiceImpl implements FactProductShoesService {

    private final FactProductShoesRepository shoeRepo;
    private final EmbeddingFactProductShoesRepository embeddingRepo;
    private final OpenAiIntentParserService intentParser;
    private final OpenAiEmbeddingService embeddingService;
    private final FilterCriteriaNormalizer filterCriteriaNormalizer;
    private final FactProductShoesPaginateUtil paginateUtil;
    private final PreFilterExtractorUtils preExtractor;
    private final ObjectMapper objectMapper;

    public FactProductShoesServiceImpl(
            FactProductShoesRepository shoeRepo,
            EmbeddingFactProductShoesRepository embeddingRepo,
            OpenAiIntentParserService intentParser,
            OpenAiEmbeddingService embeddingService,
            FilterCriteriaNormalizer filterCriteriaNormalizer,
            FactProductShoesPaginateUtil paginateUtil,
            ObjectMapper objectMapper,
            PreFilterExtractorUtils preExtractor
    ) {
        this.shoeRepo                = shoeRepo;
        this.embeddingRepo           = embeddingRepo;
        this.intentParser            = intentParser;
        this.embeddingService        = embeddingService;
        this.filterCriteriaNormalizer= filterCriteriaNormalizer;
        this.paginateUtil            = paginateUtil;
        this.objectMapper            = objectMapper;
        this.preExtractor = preExtractor;
    }

    @Override
    public Page<FactProductShoes> fetchBySpec(Specification<FactProductShoes> spec, Pageable pageable) {
        return shoeRepo.findAll(spec, pageable);
    }


    @Override
    public List<FactProductShoesRepository.LatestData> getLatestDataByBrand() {
        return shoeRepo.findLatestDatePerBrand();
    }

    @Override
    @Transactional
    public Page<FactProductShoes> aiSearch(String nlQuery, Pageable pg) {
        FilterCriteria base = preExtractor.extract(nlQuery);
        String leftover = preExtractor.strip(nlQuery);

        FilterCriteria fuzzy = intentParser.parseIntent(leftover);

        FilterCriteria c = merge(base, fuzzy);

        if (!nlQuery.matches(".*\\d.*")) {
            c.setPriceSaleMin(null);
            c.setPriceSaleMax(null);
            c.setPriceOriginalMin(null);
            c.setPriceOriginalMax(null);
        }

        FilterCriteriaNormalizer.normalize(c);

        if (c.getSortBy() != null) {
            return shoeRepo.findAll(buildSpec(c), pg);
        }

        List<FactProductShoes> filtered = shoeRepo.findAll(buildSpec(c));
        if (!filtered.isEmpty()) {
            return paginateUtil.paginateByVectorScore(filtered, nlQuery, pg, embeddingService, embeddingRepo);
        }
        return fullCatalogVectorSearch(nlQuery, pg, c.getOnSale());
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
}
