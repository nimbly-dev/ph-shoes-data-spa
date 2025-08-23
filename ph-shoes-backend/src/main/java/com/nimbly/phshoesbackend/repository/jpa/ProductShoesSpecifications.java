package com.nimbly.phshoesbackend.repository.jpa;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
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
    public static Specification<FactProductShoes> collectedOn(LocalDate d) {
        return (root, query, cb) -> cb.and(
                cb.equal(root.get("year"),  d.getYear()),
                cb.equal(root.get("month"), d.getMonthValue()),
                cb.equal(root.get("day"),   d.getDayOfMonth())
        );
    }


    public static Specification<FactProductShoes> collectedBetween(LocalDate start, LocalDate endInclusive) {
        // Turn start/end into comparable ints
        final int s = start.getYear() * 10000 + start.getMonthValue() * 100 + start.getDayOfMonth();
        final int e = endInclusive.getYear() * 10000 + endInclusive.getMonthValue() * 100 + endInclusive.getDayOfMonth();

        return (root, query, cb) -> {
            // Build YYYYMMDD from columns: year*10000 + month*100 + day
            Expression<Integer> y = root.get("year");
            Expression<Integer> m = root.get("month");
            Expression<Integer> d = root.get("day");

            Expression<Integer> yTimes = cb.prod(y, 10000);
            Expression<Integer> mTimes = cb.prod(m, 100);
            Expression<Integer> ymd    = cb.sum(cb.sum(yTimes, mTimes), d);

            return cb.between(ymd, s, e); // inclusive on both ends
        };
    }

    public static Specification<FactProductShoes> hasAnySize(List<String> sizes) {
        return (root, query, cb) -> {
            if (sizes == null || sizes.isEmpty()) {
                return cb.conjunction();
            }
            Expression<String> extra = cb.lower(root.get("extra").as(String.class));
            List<Predicate> predicates = sizes.stream()
                    .map(size -> cb.like(extra, "%\"" + size.toLowerCase() + "\"%"))
                    .toList();
            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<FactProductShoes> finalPriceGte(Double min) {
        return (root, query, cb) -> cb.or(
                cb.and(
                        cb.lessThan(root.get("priceSale"), root.get("priceOriginal")),
                        cb.greaterThanOrEqualTo(root.get("priceSale"), min)
                ),
                cb.and(
                        cb.not(cb.lessThan(root.get("priceSale"), root.get("priceOriginal"))),
                        cb.greaterThanOrEqualTo(root.get("priceOriginal"), min)
                )
        );
    }

    public static Specification<FactProductShoes> finalPriceLte(Double max) {
        return (root, query, cb) -> cb.or(
                cb.and(
                        cb.lessThan(root.get("priceSale"), root.get("priceOriginal")),
                        cb.lessThanOrEqualTo(root.get("priceSale"), max)
                ),
                cb.and(
                        cb.not(cb.lessThan(root.get("priceSale"), root.get("priceOriginal"))),
                        cb.lessThanOrEqualTo(root.get("priceOriginal"), max)
                )
        );
    }

    public static Specification<FactProductShoes> finalPriceBetween(Double min, Double max) {
        return (root, query, cb) -> cb.or(
                cb.and(
                        cb.lessThan(root.get("priceSale"), root.get("priceOriginal")),
                        cb.between(root.get("priceSale"), min, max)
                ),
                cb.and(
                        cb.not(cb.lessThan(root.get("priceSale"), root.get("priceOriginal"))),
                        cb.between(root.get("priceOriginal"), min, max)
                )
        );
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
