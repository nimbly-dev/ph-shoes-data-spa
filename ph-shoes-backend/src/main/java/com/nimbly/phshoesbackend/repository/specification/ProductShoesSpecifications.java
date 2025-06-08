package com.nimbly.phshoesbackend.repository.specification;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class ProductShoesSpecifications {

    public static Specification<FactProductShoes> hasBrand(String brand) {
        return (r, q, cb) ->
                cb.equal(cb.lower(r.get("brand")), brand.toLowerCase());
    }

    public static Specification<FactProductShoes> hasGender(String gender) {
        return (r, q, cb) ->
                cb.equal(cb.lower(r.get("gender")), gender.toLowerCase());
    }

    public static Specification<FactProductShoes> hasAgeGroup(String ageGroup) {
        return (r, q, cb) ->
                cb.equal(cb.lower(r.get("ageGroup")), ageGroup.toLowerCase());
    }

    public static Specification<FactProductShoes> priceSaleGreaterThanOrEqual(Double min) {
        return (r, q, cb) ->
                cb.greaterThanOrEqualTo(r.get("priceSale"), min);
    }

    public static Specification<FactProductShoes> priceSaleLessThanOrEqual(Double max) {
        return (r, q, cb) ->
                cb.lessThanOrEqualTo(r.get("priceSale"), max);
    }

    public static Specification<FactProductShoes> priceOriginalGreaterThanOrEqual(Double min) {
        return (r, q, cb) ->
                cb.greaterThanOrEqualTo(r.get("priceOriginal"), min);
    }

    public static Specification<FactProductShoes> priceOriginalLessThanOrEqual(Double max) {
        return (r, q, cb) ->
                cb.lessThanOrEqualTo(r.get("priceOriginal"), max);
    }

    public static Specification<FactProductShoes> titleContains(String keyword) {
        return (r, q, cb) ->
                cb.like(cb.lower(r.get("title")), "%" + keyword.toLowerCase() + "%");
    }

    public static Specification<FactProductShoes> subtitleContains(String keyword) {
        return (r, q, cb) ->
                cb.like(cb.lower(r.get("subtitle")), "%" + keyword.toLowerCase() + "%");
    }

    /**
     * Existing date-based specs — assumes your dwid is formatted YYYYMMDD
     */
    public static Specification<FactProductShoes> collectedOn(LocalDate date) {
        String dwid = date.format(DateTimeFormatter.BASIC_ISO_DATE);
        return (r, q, cb) ->
                cb.equal(r.get("key").get("dwid"), dwid);
    }

    public static Specification<FactProductShoes> collectedBetween(LocalDate start, LocalDate end) {
        String s = start.format(DateTimeFormatter.BASIC_ISO_DATE);
        String e = end.format(DateTimeFormatter.BASIC_ISO_DATE);
        return (r, q, cb) ->
                cb.between(r.get("key").get("dwid"), s, e);
    }

    /**
     * Matches title OR subtitle containing the keyword (case‐insensitive).
     * If `keyword` is blank or null, this spec returns “true” (no constraint).
     */
    public static Specification<FactProductShoes> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return cb.conjunction();
            }
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
            Predicate subtitleLike = cb.like(cb.lower(root.get("subtitle")), pattern);
            return cb.or(titleLike, subtitleLike);
        };
    }

    /**
     * Matches items where priceSale < priceOriginal (i.e. “on sale”).
     * If onSale == false (or null), this spec returns “true” (no constraint).
     */
    public static Specification<FactProductShoes> isOnSale() {
        return (root, query, cb) ->
                cb.lessThan(root.get("priceSale"), root.get("priceOriginal"));
    }

    public static Specification<FactProductShoes> byFilters(
            String brand,
            String model,
            String gender,
            Double priceSaleMin,
            Double priceSaleMax,
            Double priceOriginalMin,
            Double priceOriginalMax,
            Boolean onSale,
            List<String> titleKeywords,
            List<String> subtitleKeywords,
            String sortBy
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (brand != null) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), brand.toLowerCase()));
            }
            if (model != null) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + model.toLowerCase() + "%"));
            }
            if (gender != null) {
                predicates.add(cb.equal(cb.lower(root.get("gender")), gender.toLowerCase()));
            }
            if (priceSaleMin != null) {
                predicates.add(cb.ge(root.get("priceSale"), priceSaleMin));
            }
            if (priceSaleMax != null) {
                predicates.add(cb.le(root.get("priceSale"), priceSaleMax));
            }
            if (priceOriginalMin != null) {
                predicates.add(cb.ge(root.get("priceOriginal"), priceOriginalMin));
            }
            if (priceOriginalMax != null) {
                predicates.add(cb.le(root.get("priceOriginal"), priceOriginalMax));
            }
            if (Boolean.TRUE.equals(onSale)) {
                predicates.add(cb.lessThan(root.get("priceSale"), root.get("priceOriginal")));
            }

            // Build predicate for titleKeywords (matching only title)
            Predicate titleDisjunction = null;
            if (titleKeywords != null && !titleKeywords.isEmpty()) {
                Expression<String> titleExpr = root.get("title");
                titleDisjunction = titleKeywords.stream()
                        .map(kw -> cb.like(cb.lower(titleExpr), "%" + kw.toLowerCase() + "%"))
                        .reduce(cb.disjunction(), cb::or);
            }

            // Build predicate for subtitleKeywords (matching title OR subtitle)
            Predicate subtitleCrossDisjunction = null;
            if (subtitleKeywords != null && !subtitleKeywords.isEmpty()) {
                Expression<String> titleExpr = root.get("title");
                Expression<String> subExpr = root.get("subtitle");
                subtitleCrossDisjunction = subtitleKeywords.stream()
                        .map(kw -> {
                            String pattern = "%" + kw.toLowerCase() + "%";
                            Predicate p1 = cb.like(cb.lower(titleExpr), pattern);
                            Predicate p2 = cb.like(cb.lower(subExpr), pattern);
                            return cb.or(p1, p2);
                        })
                        .reduce(cb.disjunction(), cb::or);
            }

            // Combine titleDisjunction and subtitleCrossDisjunction
            if (titleDisjunction != null && subtitleCrossDisjunction != null) {
                predicates.add(cb.or(titleDisjunction, subtitleCrossDisjunction));
            } else if (titleDisjunction != null) {
                predicates.add(titleDisjunction);
            } else if (subtitleCrossDisjunction != null) {
                predicates.add(subtitleCrossDisjunction);
            }

            Subquery<String> maxDwid = query.subquery(String.class);
            Root<FactProductShoes> sub = maxDwid.from(FactProductShoes.class);

            Expression<String> subDwid = sub.get("key").get("dwid");
            Expression<String> subId   = sub.get("key").get("id");

            maxDwid.select(cb.greatest(subDwid))
                    .where(cb.equal(subId, root.get("key").get("id")));

            predicates.add(
                    cb.equal(
                            root.get("key").get("dwid"),
                            maxDwid
                    )
            );


            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }





}
