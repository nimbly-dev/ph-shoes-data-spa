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
        FilterCriteria criteria = intentParser.parseIntent(nlQuery);
        System.out.println("Parsed FilterCriteria = " + criteria);

        filterCriteriaNormalizer.normalize(criteria);

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
                criteria.getSortBy()
        );

        List<FactProductShoes> filteredShoes = shoeRepo.findAll(spec);
        if (filteredShoes.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        if ("price_desc".equalsIgnoreCase(criteria.getSortBy())) {
            return paginateUtil.paginateByPriceDesc(filteredShoes, pageable);
        }

        return paginateUtil.paginateByVectorScore(
                filteredShoes,
                nlQuery,
                pageable,
                embeddingService,
                embeddingRepo
        );
    }
}
