package com.nimbly.phshoesbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(
        name = "EMBEDDING_FACT_PRODUCT_SHOES",
        schema = "PRODUCTION_MARTS",
        catalog = "PH_SHOES_DB"
)
@Data
public class EmbeddingFactProductShoes {
    @Id
    @Column(name = "ID", length = 16777216)
    private String id;

    /**
     * EMBEDDING is a VARIANT containing a JSON array of floats.
     * In a native query or with @Column, e.embedding::VARCHAR
     * returns that JSON text as a String. We'll parse it manually.
     */
    @Column(name = "EMBEDDING", columnDefinition = "VARIANT")
    private String embedding;
}
