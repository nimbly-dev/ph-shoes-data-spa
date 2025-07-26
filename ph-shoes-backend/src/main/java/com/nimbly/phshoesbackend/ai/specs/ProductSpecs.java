package com.nimbly.phshoesbackend.ai.specs;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.stream.Collectors;

public class ProductSpecs {

    public static Specification<FactProductShoes> brandIn(List<String> brands) {
        List<String> lower = brands.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toList());
        return (root, query, cb) ->
                root.get("brand").as(String.class)
                        .in(lower);
    }

    public static Specification<FactProductShoes> titleMatchesPhrase(String phrase) {
        // inserts a % wildcard between each word
        String pattern = "%" + phrase.toLowerCase().trim().replaceAll("\\s+", "%") + "%";
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("title")), pattern);
    }

    public static Specification<FactProductShoes> latestOnly() {
        return (root, query, criteriaBuilder) -> {
            // Subquery returning the greatest dwid for this product.id
            Subquery<String> subquery = query.subquery(String.class);
            Root<FactProductShoes> subRoot = subquery.from(FactProductShoes.class);

            // Extract the dwid path as String
            Expression<String> dwidExpr = subRoot
                    .get("key")
                    .get("dwid")
                    .as(String.class);

            subquery.select(criteriaBuilder.greatest(dwidExpr))
                    .where(criteriaBuilder.equal(
                            subRoot.get("key").get("id"),
                            root.get("key").get("id")
                    ));

            // root.dwid == that greatest dwid
            return criteriaBuilder.equal(
                    root.get("key").get("dwid").as(String.class),
                    subquery
            );
        };
    }

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
