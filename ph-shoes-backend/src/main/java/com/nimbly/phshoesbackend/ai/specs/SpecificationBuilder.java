package com.nimbly.phshoesbackend.ai.specs;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.model.dto.AISearchFilterCriteria;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Builds a JPA Specification from AI + prefilter criteria.
 */
@Component
public class SpecificationBuilder {

    public Specification<FactProductShoes> build(AISearchFilterCriteria fc) {
        Specification<FactProductShoes> spec = (root, query, cb) -> cb.conjunction();

        System.out.println(spec);
        // brand(s)
        List<String> brands = fc.getBrands();
        if (brands != null && !brands.isEmpty()) {
            spec = spec.and(ProductSpecs.brandIn(brands));
        }

        // sizes from extras JSON
        if (fc.getSizes() != null && !fc.getSizes().isEmpty()) {
            spec = spec.and(ProductSpecs.sizeAnyInExtrasTextJson(fc.getSizes()));
        }

        // price filters
        if (fc.getPriceSaleMin() != null)      spec = spec.and(ProductSpecs.priceSaleMin(fc.getPriceSaleMin()));
        if (fc.getPriceSaleMax() != null)      spec = spec.and(ProductSpecs.priceSaleMax(fc.getPriceSaleMax()));
        if (fc.getPriceOriginalMin() != null)  spec = spec.and(ProductSpecs.priceOriginalMin(fc.getPriceOriginalMin()));
        if (fc.getPriceOriginalMax() != null)  spec = spec.and(ProductSpecs.priceOriginalMax(fc.getPriceOriginalMax()));

        // onSale
        if (Boolean.TRUE.equals(fc.getOnSale())) {
            spec = spec.and(ProductSpecs.onSale());
        }

        // title/model
        if (fc.getModel() != null && !fc.getModel().isBlank()) {
            spec = spec.and(ProductSpecs.titleMatchesPhrase(fc.getModel()));
        } else if (fc.getTitleKeywords() != null && !fc.getTitleKeywords().isEmpty()) {
            spec = spec.and(ProductSpecs.titleContainsAll(fc.getTitleKeywords()));
        }

        // freshness + guard rails
        spec = spec.and(ProductSpecs.latestOnly());

        // optional minimum positive prices (if your data sometimes has zeros)
        // spec = spec.and(ProductSpecs.priceSaleMin(0.01)).and(ProductSpecs.priceOriginalMin(0.01));

        return spec;
    }
}
