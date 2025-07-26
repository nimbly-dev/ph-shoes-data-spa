package com.nimbly.phshoesbackend.ai.orchestrator;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.repository.jpa.FactProductShoesSpecRepository;
import com.nimbly.phshoesbackend.repository.vector.FactProductShoesVectorRepository;
import com.nimbly.phshoesbackend.service.OpenAiEmbeddingService;
import com.nimbly.phshoesbackend.util.PaginateUtil;
import com.nimbly.phshoesbackend.util.VectorUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

import static com.nimbly.phshoesbackend.ai.specs.ProductSpecs.latestOnly;
import static com.nimbly.phshoesbackend.repository.jpa.ProductShoesSpecifications.hasBrand;
import static com.nimbly.phshoesbackend.repository.jpa.ProductShoesSpecifications.isOnSale;

@Component
public class VectorFallbackService {
    private final OpenAiEmbeddingService embedSvc;
    private final FactProductShoesVectorRepository vectorRepo;
    private final FactProductShoesSpecRepository specRepo;
    private final PaginateUtil paginateUtil;
    private final ObjectMapper objectMapper;

    public VectorFallbackService(
            OpenAiEmbeddingService embedSvc,
            FactProductShoesVectorRepository vectorRepo,
            FactProductShoesSpecRepository specRepo,
            PaginateUtil paginateUtil,
            ObjectMapper objectMapper
    ) {
        this.embedSvc     = embedSvc;
        this.vectorRepo   = vectorRepo;
        this.specRepo     = specRepo;
        this.paginateUtil = paginateUtil;
        this.objectMapper = objectMapper;
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

    public Page<FactProductShoes> fullCatalogSearch(
            String query,
            Pageable pg,
            boolean onSale,
            String brand
    ) {
        float[] vec = embedSvc.embed(query);
        String json = VectorUtils.toJson(vec, objectMapper);

        List<FactProductShoes> hits = onSale
                ? vectorRepo.searchByVectorOnSale(json, pg)
                : vectorRepo.searchByVector(json, pg);

        List<Specification<FactProductShoes>> specs = new ArrayList<>();
        if (brand != null && !brand.isBlank()) {
            specs.add(hasBrand(brand));
        }
        if (onSale) {
            specs.add(isOnSale());
        }
        specs.add(latestOnly());

        Specification<FactProductShoes> countSpec = Specification.allOf(specs);
        long total = specRepo.count(countSpec);

        return new PageImpl<>(hits, pg, total);
    }
}