package com.nimbly.phshoesbackend.ai.orchestrator;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.repository.FactProductShoesRepository;
import com.nimbly.phshoesbackend.service.OpenAiEmbeddingService;
import com.nimbly.phshoesbackend.util.PaginateUtil;
import com.nimbly.phshoesbackend.util.VectorUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class VectorFallbackService {
    private final OpenAiEmbeddingService     embedSvc;
    private final FactProductShoesRepository shoeRepo;
    private final PaginateUtil               paginateUtil;
    private final ObjectMapper               objectMapper;

    public VectorFallbackService(
            OpenAiEmbeddingService embedSvc,
            FactProductShoesRepository shoeRepo,
            PaginateUtil paginateUtil,
            ObjectMapper objectMapper
    ) {
        this.embedSvc      = embedSvc;
        this.shoeRepo      = shoeRepo;
        this.paginateUtil  = paginateUtil;
        this.objectMapper  = objectMapper;
    }

    /** Cosine-rank a small candidate set. */
    public Page<FactProductShoes> rankWithin(
            List<FactProductShoes> candidates,
            String nlQuery,
            Pageable pg
    ) {
        float[] vec = embedSvc.embed(nlQuery);
        return paginateUtil.paginateByVectorScore(candidates, vec, pg);
    }

    /** Full-catalog vector search via your FactProductShoesRepository. */
    public Page<FactProductShoes> fullCatalogSearch(
            String nlQuery,
            Pageable pg,
            boolean onSale
    ) {
        // 1) embed + serialize to JSON
        float[] vec = embedSvc.embed(nlQuery);
        String json = VectorUtils.toJson(vec, objectMapper);

        // 2) call the vector SQL methods on FactProductShoesRepository
        List<FactProductShoes> results = onSale
                ? shoeRepo.findOnSaleByVector(json, pg)
                : shoeRepo.findAllByVector(json, pg);

        // 3) count for paging
        long total = onSale
                ? shoeRepo.countDistinctOnSaleProducts()
                : shoeRepo.countDistinctProducts();

        return new PageImpl<>(results, pg, total);
    }
}