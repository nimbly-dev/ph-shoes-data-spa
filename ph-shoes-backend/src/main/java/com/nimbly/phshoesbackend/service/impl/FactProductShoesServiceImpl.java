package com.nimbly.phshoesbackend.service.impl;

import com.nimbly.phshoesbackend.ai.orchestrator.SearchOrchestrator;
import com.nimbly.phshoesbackend.ai.pipeline.FilterPipeline;
import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.model.dto.FilterCriteria;
import com.nimbly.phshoesbackend.repository.FactProductShoesRepository;
import com.nimbly.phshoesbackend.service.FactProductShoesService;
import com.nimbly.phshoesbackend.util.AiRetry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class FactProductShoesServiceImpl implements FactProductShoesService {

    private final static int MAX_PAGE_SIZE = 2500;

    private final FilterPipeline pipeline;
    private final SearchOrchestrator orchestrator;
    private final FactProductShoesRepository shoeRepo;
    private final AiRetry aiRetry;

    @Value("${ai-search.vector-enabled:true}")
    private boolean vectorEnabled;

    public FactProductShoesServiceImpl(
            FilterPipeline pipeline,
            SearchOrchestrator orchestrator,
            FactProductShoesRepository shoeRepo,
            AiRetry aiRetry
    ) {
        this.pipeline     = pipeline;
        this.orchestrator = orchestrator;
        this.shoeRepo                = shoeRepo;
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
    @Transactional(readOnly = true)
    public Page<FactProductShoes> aiSearch(String nlQuery, Pageable pg) {
        // build + normalize + validate criteria
        FilterCriteria criteria = pipeline.process(nlQuery);
        // run spec-search or vector-fallback
        return orchestrator.search(nlQuery, criteria, pg);
    }

}
