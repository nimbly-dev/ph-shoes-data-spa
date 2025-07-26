package com.nimbly.phshoesbackend.ai.specs;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.model.dto.AISearchFilterCriteria;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SpecificationBuilder {

    public Specification<FactProductShoes> build(AISearchFilterCriteria fc) {
        Specification<FactProductShoes> spec = (root, query, cb) -> cb.conjunction();

        // --- BRAND(S) filter: use brandIn(...) if any brands were detected ---
        List<String> brands = fc.getBrands();
        if (brands != null && !brands.isEmpty()) {
            spec = spec.and(ProductSpecs.brandIn(brands));
        }

        // --- price filters ---
        if (fc.getPriceSaleMin() != null) {
            spec = spec.and(ProductSpecs.priceSaleMin(fc.getPriceSaleMin()));
        }
        if (fc.getPriceSaleMax() != null) {
            spec = spec.and(ProductSpecs.priceSaleMax(fc.getPriceSaleMax()));
        }
        if (fc.getPriceOriginalMin() != null) {
            spec = spec.and(ProductSpecs.priceOriginalMin(fc.getPriceOriginalMin()));
        }
        if (fc.getPriceOriginalMax() != null) {
            spec = spec.and(ProductSpecs.priceOriginalMax(fc.getPriceOriginalMax()));
        }

        // --- onSale flag ---
        if (Boolean.TRUE.equals(fc.getOnSale())) {
            spec = spec.and(ProductSpecs.onSale());
        }

        // --- title filtering: phrase vs keyword ---
        if (fc.getModel() != null && !fc.getModel().isBlank()) {
            spec = spec.and(ProductSpecs.titleMatchesPhrase(fc.getModel()));
        } else {
            List<String> keywords = fc.getTitleKeywords();
            if (keywords != null && !keywords.isEmpty()) {
                spec = spec.and(ProductSpecs.titleContainsAll(keywords));
            }
        }

        // --- always only the latest record per product ID ---
        spec = spec.and(ProductSpecs.latestOnly());

        //TODO: Prices 0's SHOULD be handled by the ETL/Data Collection side, for now all 0's will be excluded.
        spec = spec.and(ProductSpecs.priceSaleMin(0.01))
                .and(ProductSpecs.priceOriginalMin(0.01));

        return spec;
    }
}
