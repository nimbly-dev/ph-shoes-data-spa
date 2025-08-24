package com.nimbly.phshoesbackend.ai.orchestrator;

import com.nimbly.phshoesbackend.ai.specs.SpecificationBuilder;
import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.model.dto.AISearchFilterCriteria;
import com.nimbly.phshoesbackend.repository.jpa.FactProductShoesSpecRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
public class SearchOrchestrator {
    private static final int MAX_PAGE_SIZE = 1000;

    private final FactProductShoesSpecRepository specRepo;
    private final SpecificationBuilder specBuilder;
    private final VectorFallbackService fallback;

    public SearchOrchestrator(
            FactProductShoesSpecRepository specRepo,
            SpecificationBuilder specBuilder,
            VectorFallbackService fallback
    ) {
        this.specRepo    = specRepo;
        this.specBuilder = specBuilder;
        this.fallback    = fallback;
    }

    /**
     * 1) If user asked to sort by price, do a simple spec + price sort.
     * 2) Otherwise: run the full spec (including latestOnly),
     *    then if empty, do vector fallback.
     */
    public Page<FactProductShoes> search(
            String naturalLanguageQuery,
            AISearchFilterCriteria criteria,
            Pageable pageable,
            boolean useVector
    ) {
        Specification<FactProductShoes> baseSpec = specBuilder.build(criteria);


        if (StringUtils.hasText(criteria.getSortBy())) {
            Sort priceSort = "price_asc".equals(criteria.getSortBy())
                    ? Sort.by("priceSale").ascending()
                    : Sort.by("priceSale").descending();

            Pageable pricePageable = PageRequest.of(
                    pageable.getPageNumber(),
                    pageable.getPageSize(),
                    priceSort
            );
            return specRepo.findAll(baseSpec, pricePageable);
        }

        Page<FactProductShoes> candidates = specRepo.findAll(
                baseSpec,
                PageRequest.of(0, MAX_PAGE_SIZE, pageable.getSort())
        );

        if (!useVector) {
            return specRepo.findAll(specBuilder.build(criteria), pageable);
        }

        if (!candidates.hasContent()) {
            boolean onSaleFlag = Boolean.TRUE.equals(criteria.getOnSale());
            String brand = (criteria.getBrands() != null && !criteria.getBrands().isEmpty())
                    ? criteria.getBrands().getFirst()
                    : null;
            return fallback.fullCatalogSearch(
                    naturalLanguageQuery,
                    pageable,
                    onSaleFlag,
                    brand
            );
        }
        // if we did get rows, rank them by vector similarity
        return fallback.rankWithin(
                candidates.getContent(),
                naturalLanguageQuery,
                pageable
        );
    }
}