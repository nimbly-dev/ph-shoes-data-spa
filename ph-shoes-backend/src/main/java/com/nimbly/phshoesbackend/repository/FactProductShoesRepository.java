package com.nimbly.phshoesbackend.repository;


import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.model.FactProductShoesId;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public interface FactProductShoesRepository
        extends JpaRepository<FactProductShoes, FactProductShoesId>,
        JpaSpecificationExecutor<FactProductShoes> {

    @Query(value = "SELECT * FROM PH_SHOES_DB.PRODUCTION_MARTS.FACT_PRODUCT_SHOES", nativeQuery = true)
    List<Map<String,Object>> rawAll();

    // --- vector searches against the full catalog ---
    @Query(value = """
        SELECT
          f.ID             AS "id",
          f.DWID           AS "dwid",
          f.BRAND          AS "brand",
          f.YEAR           AS "year",
          f.MONTH          AS "month",
          f.DAY            AS "day",
          f.TITLE          AS "title",
          f.SUBTITLE       AS "subtitle",
          f.URL            AS "url",
          f.IMAGE          AS "image",
          f.PRICE_SALE     AS "price_sale",
          f.PRICE_ORIGINAL AS "price_original",
          f.GENDER         AS "gender",
          f.AGE_GROUP      AS "age_group"
        FROM PH_SHOES_DB.PRODUCTION_MARTS.FACT_PRODUCT_SHOES f
        JOIN PH_SHOES_DB.PRODUCTION_MARTS.EMBEDDING_FACT_PRODUCT_SHOES e
          ON f.ID = e.ID
        QUALIFY ROW_NUMBER() OVER (PARTITION BY f.ID ORDER BY f.DWID DESC) = 1
        ORDER BY VECTOR_COSINE_SIMILARITY(
          e.embedding::VECTOR(FLOAT,1536),
          PARSE_JSON(:queryEmbeddingJson)::VECTOR(FLOAT,1536)
        ) DESC
        LIMIT   :#{#pageable.pageSize}
        OFFSET  :#{#pageable.offset}
        """,
            nativeQuery = true)
    List<FactProductShoes> findAllByVector(
            @Param("queryEmbeddingJson") String queryEmbeddingJson,
            Pageable pageable
    );

    @Query(value = """
        SELECT
          f.ID             AS "id",
          f.DWID           AS "dwid",
          f.BRAND          AS "brand",
          f.YEAR           AS "year",
          f.MONTH          AS "month",
          f.DAY            AS "day",
          f.TITLE          AS "title",
          f.SUBTITLE       AS "subtitle",
          f.URL            AS "url",
          f.IMAGE          AS "image",
          f.PRICE_SALE     AS "price_sale",
          f.PRICE_ORIGINAL AS "price_original",
          f.GENDER         AS "gender",
          f.AGE_GROUP      AS "age_group"
        FROM PH_SHOES_DB.PRODUCTION_MARTS.FACT_PRODUCT_SHOES f
        JOIN PH_SHOES_DB.PRODUCTION_MARTS.EMBEDDING_FACT_PRODUCT_SHOES e
          ON f.ID = e.ID
        WHERE f.PRICE_SALE < f.PRICE_ORIGINAL
        QUALIFY ROW_NUMBER() OVER (PARTITION BY f.ID ORDER BY f.DWID DESC) = 1
        ORDER BY VECTOR_COSINE_SIMILARITY(
          e.embedding::VECTOR(FLOAT,1536),
          PARSE_JSON(:queryEmbeddingJson)::VECTOR(FLOAT,1536)
        ) DESC
        LIMIT   :#{#pageable.pageSize}
        OFFSET  :#{#pageable.offset}
        """,
            nativeQuery = true)
    List<FactProductShoes> findOnSaleByVector(
            @Param("queryEmbeddingJson") String queryEmbeddingJson,
            Pageable pageable
    );

    @Query(value = """
        SELECT COUNT(DISTINCT ID)
          FROM PH_SHOES_DB.PRODUCTION_MARTS.FACT_PRODUCT_SHOES
        """,
            nativeQuery = true)
    long countDistinctProducts();

    @Query(value = """
        SELECT COUNT(DISTINCT ID)
          FROM PH_SHOES_DB.PRODUCTION_MARTS.FACT_PRODUCT_SHOES
         WHERE PRICE_SALE < PRICE_ORIGINAL
        """,
            nativeQuery = true)
    long countDistinctOnSaleProducts();

    static interface LatestData {
        String    getBrand();
        LocalDate getLatestDate();
    }

    @Query(value = """
      SELECT
        BRAND                    AS brand,
        MAX(
          TO_DATE(
            CONCAT(YEAR,'-',LPAD(MONTH,2,'0'),'-',LPAD(DAY,2,'0')),
            'YYYY-MM-DD'
          )
        ) AS latestDate
      FROM PH_SHOES_DB.PRODUCTION_MARTS.FACT_PRODUCT_SHOES
      WHERE BRAND IS NOT NULL
      GROUP BY BRAND
      """, nativeQuery = true)
    List<LatestData> findLatestDatePerBrand();
}