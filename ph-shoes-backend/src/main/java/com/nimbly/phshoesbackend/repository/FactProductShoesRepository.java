package com.nimbly.phshoesbackend.repository;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.model.FactProductShoesId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/*
    Uses JpaSpecificationExecutor for dynamic WHERE clauses via the Specification pattern
 */
@Repository
public interface FactProductShoesRepository
        extends JpaRepository<FactProductShoes, FactProductShoesId>,
                JpaSpecificationExecutor<FactProductShoes> {

    @Query(value = "SELECT * FROM PH_SHOES_DB.PRODUCTION_MARTS.FACT_PRODUCT_SHOES", nativeQuery = true)
    List<Map<String,Object>> rawAll();

    /**
     * Given a JSON array of IDs (“idsJson”) and a JSON‐array embedding (“queryEmbeddingJson”),
     * return only those rows whose id is in idsJson, ordered by VECTOR_COSINE_SIMILARITY.
     */
    @Query(value = """
        SELECT f.*
        FROM PH_SHOES_DB.PRODUCTION_MARTS.FACT_PRODUCT_SHOES f
        JOIN PH_SHOES_DB.PRODUCTION_MARTS.EMBEDDING_FACT_PRODUCT_SHOES e
          ON f.id = e.id
        WHERE f.id IN (
          SELECT VALUE::STRING
          FROM TABLE(FLATTEN(input => PARSE_JSON(:idsJson)))
        )
        ORDER BY VECTOR_COSINE_SIMILARITY(
          VECTOR_PARSE(e.embedding),
          VECTOR_PARSE(PARSE_JSON(:queryEmbeddingJson))
        ) DESC
        LIMIT :#{#pageable.pageSize}
        OFFSET :#{#pageable.offset}
        """,
            nativeQuery = true)
    List<FactProductShoes> findByIdsVectorRanked(
            @Param("idsJson") String idsJson,
            @Param("queryEmbeddingJson") String queryEmbeddingJson,
            Pageable pageable
    );

    /**
     * Given a JSON array of IDs (“idsJson”), return each product and its embedding JSON.
     * e.embedding::VARCHAR returns the VARIANT array as a JSON string.
     */
    @Query(value = """
        SELECT f.*,
               e.embedding::VARCHAR AS embedding_json
        FROM PH_SHOES_DB.PRODUCTION_MARTS.FACT_PRODUCT_SHOES f
        JOIN PH_SHOES_DB.PRODUCTION_MARTS.EMBEDDING_FACT_PRODUCT_SHOES e
          ON f.id = e.id
        WHERE f.id IN (
          SELECT VALUE::STRING
          FROM TABLE(FLATTEN(input => PARSE_JSON(:idsJson)))
        )
        """,
            nativeQuery = true)
    List<Object[]> findAllWithEmbeddingByIds(@Param("idsJson") String idsJson);

}
