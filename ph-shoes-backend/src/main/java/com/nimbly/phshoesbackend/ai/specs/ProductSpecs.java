package com.nimbly.phshoesbackend.ai.specs;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class ProductSpecs {

    public static Specification<FactProductShoes> brandEquals(String brand) {
        return (root, query, cb) ->
                cb.equal(cb.lower(root.get("brand")), brand.toLowerCase());
    }

    public static Specification<FactProductShoes> modelEquals(String model) {
        return (root, query, cb) ->
                cb.equal(root.get("key").get("id"), model);
    }

    public static Specification<FactProductShoes> genderEquals(String gender) {
        return (root, query, cb) ->
                cb.equal(cb.lower(root.get("gender")), gender.toLowerCase());
    }

    public static Specification<FactProductShoes> priceSaleMin(Double min) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("priceSale"), min);
    }

    public static Specification<FactProductShoes> priceSaleMax(Double max) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("priceSale"), max);
    }

    public static Specification<FactProductShoes> priceOriginalMin(Double min) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("priceOriginal"), min);
    }

    public static Specification<FactProductShoes> priceOriginalMax(Double max) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("priceOriginal"), max);
    }

    public static Specification<FactProductShoes> onSale() {
        return (root, query, cb) -> cb.and(
                cb.isNotNull(root.get("priceSale")),
                cb.lessThan(root.get("priceSale"), root.get("priceOriginal"))
        );
    }

    public static Specification<FactProductShoes> titleContainsAll(List<String> keywords) {
        return (root, query, cb) -> {
            Predicate p = cb.conjunction();
            Expression<String> exp = cb.lower(root.get("title"));
            for (String kw : keywords) {
                p = cb.and(p, cb.like(exp, "%" + kw.toLowerCase() + "%"));
            }
            return p;
        };
    }

    public static Specification<FactProductShoes> subtitleContainsAll(List<String> keywords) {
        return (root, query, cb) -> {
            Predicate p = cb.conjunction();
            Expression<String> exp = cb.lower(root.get("subtitle"));
            for (String kw : keywords) {
                p = cb.and(p, cb.like(exp, "%" + kw.toLowerCase() + "%"));
            }
            return p;
        };
    }
}
