package com.nimbly.phshoesbackend.repository;

import com.nimbly.phshoesbackend.model.EmbeddingFactProductShoes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * We’ll use this to bulk‐fetch embeddings for a list of IDs.
 */
@Repository
public interface EmbeddingFactProductShoesRepository
        extends JpaRepository<EmbeddingFactProductShoes, String> {

    /**
     * Given a list of product IDs, return all corresponding embedding rows.
     * Spring Data JPA will generate SELECT ... WHERE ID IN (:ids) automatically.
     */
    List<EmbeddingFactProductShoes> findByIdIn(List<String> ids);
}