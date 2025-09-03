package com.nimbly.phshoesbackend.repository.vector;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.model.FactProductShoesId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FactProductShoesVectorRepository
        extends JpaRepository<FactProductShoes, FactProductShoesId> {

    @Query(value = """
        SELECT
          TO_VARCHAR(f.DWID)   AS "dwid",
          TO_VARCHAR(f.ID)     AS "id",
          f.BRAND              AS "brand",
          f.YEAR               AS "year",
          f.MONTH              AS "month",
          f.DAY                AS "day",
          f.TITLE              AS "title",
          f.SUBTITLE           AS "subtitle",
          f.URL                AS "url",
          f.IMAGE              AS "image",
          f.PRICE_SALE         AS "price_sale",
          f.PRICE_ORIGINAL     AS "price_original",
          f.GENDER             AS "gender",
          f.AGE_GROUP          AS "age_group",
          TO_VARCHAR(f.EXTRA)  AS "extra"
        FROM PH_SHOES_DB.PRODUCTION_MARTS.FACT_PRODUCT_SHOES f
        JOIN PH_SHOES_DB.PRODUCTION_MARTS.EMBEDDING_FACT_PRODUCT_SHOES e
          ON f.ID = e.ID
        QUALIFY ROW_NUMBER() OVER (PARTITION BY f.ID ORDER BY f.DWID DESC) = 1
        ORDER BY VECTOR_COSINE_SIMILARITY(
          e.EMBEDDING::VECTOR(FLOAT,1536),
          PARSE_JSON(:queryEmbeddingJson)::VECTOR(FLOAT,1536)
        ) DESC
        LIMIT  :#{#pageable.pageSize}
        OFFSET :#{#pageable.offset}
        """, nativeQuery = true)
    List<FactProductShoes> searchByVector(
            @Param("queryEmbeddingJson") String queryEmbeddingJson,
            Pageable pageable
    );

    @Query(value = """
        SELECT
          TO_VARCHAR(f.DWID)   AS "dwid",
          TO_VARCHAR(f.ID)     AS "id",
          f.BRAND              AS "brand",
          f.YEAR               AS "year",
          f.MONTH              AS "month",
          f.DAY                AS "day",
          f.TITLE              AS "title",
          f.SUBTITLE           AS "subtitle",
          f.URL                AS "url",
          f.IMAGE              AS "image",
          f.PRICE_SALE         AS "price_sale",
          f.PRICE_ORIGINAL     AS "price_original",
          f.GENDER             AS "gender",
          f.AGE_GROUP          AS "age_group",
          TO_VARCHAR(f.EXTRA)  AS "extra"
        FROM PH_SHOES_DB.PRODUCTION_MARTS.FACT_PRODUCT_SHOES f
        JOIN PH_SHOES_DB.PRODUCTION_MARTS.EMBEDDING_FACT_PRODUCT_SHOES e
          ON f.ID = e.ID
        WHERE f.PRICE_SALE < f.PRICE_ORIGINAL
        QUALIFY ROW_NUMBER() OVER (PARTITION BY f.ID ORDER BY f.DWID DESC) = 1
        ORDER BY VECTOR_COSINE_SIMILARITY(
          e.EMBEDDING::VECTOR(FLOAT,1536),
          PARSE_JSON(:queryEmbeddingJson)::VECTOR(FLOAT,1536)
        ) DESC
        LIMIT  :#{#pageable.pageSize}
        OFFSET :#{#pageable.offset}
        """, nativeQuery = true)
    List<FactProductShoes> searchByVectorOnSale(
            @Param("queryEmbeddingJson") String queryEmbeddingJson,
            Pageable pageable
    );
}