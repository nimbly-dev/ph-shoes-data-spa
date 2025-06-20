package com.nimbly.phshoesbackend.repository.specification;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

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

            // — FILTERS (brand, gender, ranges, keywords, DWID subquery) —
            if (brand != null) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), brand.toLowerCase()));
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

            // model vs titleKeywords
            if (model != null) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + model.toLowerCase() + "%"));
            } else if (titleKeywords != null && !titleKeywords.isEmpty()) {
                Predicate[] titlePreds = titleKeywords.stream()
                        .map(kw -> cb.like(cb.lower(root.get("title")), "%" + kw.toLowerCase() + "%"))
                        .toArray(Predicate[]::new);
                predicates.add(cb.or(titlePreds));
            }

            // subtitleKeywords (title OR subtitle)
            if (subtitleKeywords != null && !subtitleKeywords.isEmpty()) {
                Expression<String> titleExpr = cb.lower(root.get("title"));
                Expression<String> subExpr   = cb.lower(root.get("subtitle"));
                Predicate[] subtitlePreds = subtitleKeywords.stream()
                        .flatMap(kw -> {
                            String pat = "%" + kw.toLowerCase() + "%";
                            return Stream.of(
                                    cb.like(titleExpr, pat),
                                    cb.like(subExpr,   pat)
                            );
                        })
                        .toArray(Predicate[]::new);
                predicates.add(cb.or(subtitlePreds));
            }

            // latest-DWID subquery (unchanged)
            Subquery<String> maxDwid = query.subquery(String.class);
            Root<FactProductShoes> subRoot = maxDwid.from(FactProductShoes.class);
            Expression<String> subId = subRoot.get("key").get("id").as(String.class);
            Expression<String> subDwid = subRoot.get("key").get("dwid").as(String.class);
            maxDwid.select(cb.greatest(subDwid))
                    .where(cb.equal(subId, root.get("key").get("id").as(String.class)));
            predicates.add(cb.equal(root.get("key").get("dwid").as(String.class), maxDwid));

            Predicate finalPred = cb.and(predicates.toArray(new Predicate[0]));

            // — SORTING ON FINAL PRICE (sale?sale:original) —
            if ("price_asc".equalsIgnoreCase(sortBy) || "price_desc".equalsIgnoreCase(sortBy)) {
                // CASE WHEN price_sale < price_original THEN price_sale ELSE price_original END
                Expression<Object> finalPriceExpr = cb.selectCase()
                        .when(
                                cb.lessThan(root.get("priceSale"), root.get("priceOriginal")),
                                root.get("priceSale")
                        )
                        .otherwise(root.get("priceOriginal"));

                if ("price_asc".equalsIgnoreCase(sortBy)) {
                    query.orderBy(cb.asc(finalPriceExpr));
                } else {
                    query.orderBy(cb.desc(finalPriceExpr));
                }
            }

            return finalPred;
        };
    }

}
