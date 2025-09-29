package com.nimbly.phshoesbackend.repository.jpa;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

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
            if (sizes == null || sizes.isEmpty()) return cb.conjunction();
            Expression<String> extraTxt = cb.function("TO_VARCHAR", String.class, root.get("extra"));

            Predicate[] any = sizes.stream()
                    .filter(Objects::nonNull).map(String::trim).filter(s -> !s.isEmpty())
                    .map(s -> cb.or(
                            cb.like(extraTxt, "%\"sizes\"%[\"" + s + "\"%"),
                            cb.like(extraTxt, "%,\"" + s + "\"%"),
                            cb.like(extraTxt, "%\"" + s + "\"]%")
                    ))
                    .toArray(Predicate[]::new);

            return cb.or(any);
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

    /** title LIKE any of the phrases (OR). */
    public static Specification<FactProductShoes> titleContainsAny(List<String> phrases) {
        return (Root<FactProductShoes> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            if (phrases == null || phrases.isEmpty()) return cb.conjunction();

            Expression<String> title = cb.lower(root.get("title"));

            Predicate[] likes = phrases.stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .filter(s -> !s.isBlank())
                    .map(s -> cb.like(title, "%" + s + "%"))
                    .toArray(Predicate[]::new);

            return likes.length == 0 ? cb.conjunction() : cb.or(likes);
        };
    }

    /** title LIKE all of the phrases (AND). */
    public static Specification<FactProductShoes> titleContainsAll(List<String> phrases) {
        return (Root<FactProductShoes> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            if (phrases == null || phrases.isEmpty()) return cb.conjunction();

            Expression<String> title = cb.lower(root.get("title"));

            Predicate[] likes = phrases.stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .filter(s -> !s.isBlank())
                    .map(s -> cb.like(title, "%" + s + "%"))
                    .toArray(Predicate[]::new);

            return likes.length == 0 ? cb.conjunction() : cb.and(likes);
        };
    }



}
