package com.nimbly.phshoesbackend.service.impl;

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

    public FactProductShoesServiceImpl(
            FactProductShoesRepository shoeRepo,
            EmbeddingFactProductShoesRepository embeddingRepo,
            OpenAiIntentParserService intentParser,
            OpenAiEmbeddingService embeddingService,
            FilterCriteriaNormalizer filterCriteriaNormalizer,
            FactProductShoesPaginateUtil paginateUtil
    ) {
        this.shoeRepo = shoeRepo;
        this.embeddingRepo = embeddingRepo;
        this.intentParser = intentParser;
        this.embeddingService = embeddingService;
        this.filterCriteriaNormalizer = filterCriteriaNormalizer;
        this.paginateUtil = paginateUtil;
    }

    @Override
    public Page<FactProductShoes> fetchBySpec(Specification<FactProductShoes> spec, Pageable pageable) {
        return shoeRepo.findAll(spec, pageable);
    }

    @Override
    @Transactional
    public Page<FactProductShoes> aiSearch(String nlQuery, Pageable pageable) {
        // 1) Parse & normalize
        FilterCriteria criteria = intentParser.parseIntent(nlQuery);
        filterCriteriaNormalizer.normalize(criteria);

        // 2) If user said “cheapest” but parser didn’t set sortBy, do it now
        if ((criteria.getSortBy() == null || criteria.getSortBy().isBlank())
                && nlQuery.toLowerCase().contains("cheapest")) {
            criteria.setSortBy("price_asc");
        }

        // 3) Build spec with the correct sortBy
        Specification<FactProductShoes> spec = ProductShoesSpecifications.byFilters(
                criteria.getBrand(),
                criteria.getModel(),
                criteria.getGender(),
                criteria.getPriceSaleMin(),
                criteria.getPriceSaleMax(),
                criteria.getPriceOriginalMin(),
                criteria.getPriceOriginalMax(),
                criteria.getOnSale(),
                criteria.getTitleKeywords(),
                criteria.getSubtitleKeywords(),
                criteria.getSortBy()      // now “price_asc” if needed
        );

        // 4) If price sorting requested, let JPA/Hibernate do it WITH pagination
        if ("price_asc".equalsIgnoreCase(criteria.getSortBy())
                || "price_desc".equalsIgnoreCase(criteria.getSortBy())) {
            return shoeRepo.findAll(spec, pageable);
        }

        // 5) Otherwise vector fallback
        List<FactProductShoes> filtered = shoeRepo.findAll(spec);
        if (filtered.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }
        return paginateUtil.paginateByVectorScore(
                filtered, nlQuery, pageable,
                embeddingService,
                embeddingRepo
        );
    }

    @Override
    public List<FactProductShoesRepository.LatestData> getLatestDataByBrand() {
        return shoeRepo.findLatestDatePerBrand();
    }

}
