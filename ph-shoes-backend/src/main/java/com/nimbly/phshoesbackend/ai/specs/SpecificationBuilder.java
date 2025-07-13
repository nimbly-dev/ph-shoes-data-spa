package com.nimbly.phshoesbackend.ai.specs;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.model.dto.FilterCriteria;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SpecificationBuilder {
    public Specification<FactProductShoes> build(FilterCriteria c) {
        Specification<FactProductShoes> spec = Specification.where(null);

        if (c.getBrand() != null) {
            spec = spec.and(ProductSpecs.brandEquals(c.getBrand()));
        }
        if (c.getModel() != null) {
            spec = spec.and(ProductSpecs.modelEquals(c.getModel()));
        }
        if (c.getGender() != null) {
            spec = spec.and(ProductSpecs.genderEquals(c.getGender()));
        }
        if (c.getPriceSaleMin() != null) {
            spec = spec.and(ProductSpecs.priceSaleMin(c.getPriceSaleMin()));
        }
        if (c.getPriceSaleMax() != null) {
            spec = spec.and(ProductSpecs.priceSaleMax(c.getPriceSaleMax()));
        }
        if (c.getPriceOriginalMin() != null) {
            spec = spec.and(ProductSpecs.priceOriginalMin(c.getPriceOriginalMin()));
        }
        if (c.getPriceOriginalMax() != null) {
            spec = spec.and(ProductSpecs.priceOriginalMax(c.getPriceOriginalMax()));
        }
        if (Boolean.TRUE.equals(c.getOnSale())) {
            spec = spec.and(ProductSpecs.onSale());
        }

        List<String> titles = c.getTitleKeywords();
        if (titles != null && !titles.isEmpty()) {
            spec = spec.and(ProductSpecs.titleContainsAll(titles));
        }
        List<String> subs = c.getSubtitleKeywords();
        if (subs != null && !subs.isEmpty()) {
            spec = spec.and(ProductSpecs.subtitleContainsAll(subs));
        }

        return spec;
    }
}
