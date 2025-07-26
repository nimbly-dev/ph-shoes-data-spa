package com.nimbly.phshoesbackend.repository.jpa;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.model.FactProductShoesId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FactProductShoesSpecRepository
        extends JpaRepository<FactProductShoes, FactProductShoesId>,
        JpaSpecificationExecutor<FactProductShoes> {

    // --- derived counts, no native SQL needed ---
    @Query("""
    SELECT COUNT(DISTINCT f.key.id)
      FROM FactProductShoes f
     WHERE LOWER(f.brand) = LOWER(:brand)
    """)
    long countDistinctIdsByBrand(@Param("brand") String brand);

    @Query("""
    SELECT COUNT(DISTINCT f.key.id)
      FROM FactProductShoes f
     WHERE LOWER(f.brand) = LOWER(:brand)
       AND f.priceSale < f.priceOriginal
    """)
    long countDistinctIdsByBrandAndOnSale(@Param("brand") String brand);

    // --- custom grouping query, in JPQL ---
    interface LatestData {
        String getBrand();
        String getLatestDwid();     // or LocalDate getLatestDwid();
    }

    @Query("""
      SELECT f.brand        AS brand,
             MAX(f.key.dwid) AS latestDwid
        FROM FactProductShoes f
       WHERE f.brand IS NOT NULL
       GROUP BY f.brand
      """)
    List<LatestData> findLatestDatePerBrand();
}