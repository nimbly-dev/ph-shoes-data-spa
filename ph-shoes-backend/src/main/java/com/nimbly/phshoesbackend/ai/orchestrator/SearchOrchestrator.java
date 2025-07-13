package com.nimbly.phshoesbackend.ai.orchestrator;

import com.nimbly.phshoesbackend.ai.specs.SpecificationBuilder;
import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.model.dto.FilterCriteria;
import com.nimbly.phshoesbackend.repository.FactProductShoesRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class SearchOrchestrator {
    private static final int MAX_PAGE_SIZE = 1000;

    private final FactProductShoesRepository shoeRepo;
    private final SpecificationBuilder specBuilder;
    private final VectorFallbackService fallback;

    public SearchOrchestrator(
            FactProductShoesRepository shoeRepo,
            SpecificationBuilder specBuilder,
            VectorFallbackService fallback
    ) {
        this.shoeRepo    = shoeRepo;
        this.specBuilder = specBuilder;
        this.fallback    = fallback;
    }

    /**
     * 1) If user asked to sort by price, do a normal JPA spec + pageable.
     * 2) Otherwise: load up to MAX_PAGE_SIZE matching entities, then
     *    a) if any → rank/filter by vector score
     *    b) else → full-catalog vector search
     */
    public Page<FactProductShoes> search(
            String nlQuery,
            FilterCriteria criteria,
            Pageable pg
    ) {
        Specification<FactProductShoes> spec = specBuilder.build(criteria);

        if (criteria.getSortBy() != null) {
            return shoeRepo.findAll(spec, pg);
        }

        Page<FactProductShoes> cap = shoeRepo.findAll(
                spec,
                PageRequest.of(0, MAX_PAGE_SIZE, pg.getSort())
        );

        if (!cap.getContent().isEmpty()) {
            return fallback.rankWithin(cap.getContent(), nlQuery, pg);
        }

        // ← Here’s the corrected onSale extraction:
        boolean onSale = Boolean.TRUE.equals(criteria.getOnSale());
        return fallback.fullCatalogSearch(nlQuery, pg, onSale);
    }
}