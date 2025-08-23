package com.nimbly.phshoesbackend.ai.specs;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecs {

    private ProductSpecs() {}

    public static Specification<FactProductShoes> brandIn(List<String> brands) {
        return (root, query, cb) -> {
            if (brands == null || brands.isEmpty()) return cb.conjunction();
            Expression<String> brand = cb.lower(root.get("brand"));
            List<Predicate> ps = new ArrayList<>();
            for (String b : brands) {
                ps.add(cb.equal(brand, b.toLowerCase()));
            }
            return cb.or(ps.toArray(new Predicate[0]));
        };
    }

    public static Specification<FactProductShoes> priceSaleMin(double v) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("priceSale"), v);
    }

    public static Specification<FactProductShoes> priceSaleMax(double v) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("priceSale"), v);
    }

    public static Specification<FactProductShoes> priceOriginalMin(double v) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("priceOriginal"), v);
    }

    public static Specification<FactProductShoes> priceOriginalMax(double v) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("priceOriginal"), v);
    }

    public static Specification<FactProductShoes> onSale() {
        return (root, query, cb) -> cb.lessThan(root.get("priceSale"), root.get("priceOriginal"));
    }

    public static Specification<FactProductShoes> titleMatchesPhrase(String phrase) {
        return (root, query, cb) ->
                cb.like(cb.lower(root.get("title")), "%" + phrase.toLowerCase() + "%");
    }

    public static Specification<FactProductShoes> titleContainsAll(List<String> terms) {
        return (root, query, cb) -> {
            if (terms == null || terms.isEmpty()) return cb.conjunction();
            Expression<String> t = cb.lower(root.get("title"));
            Predicate p = cb.conjunction();
            for (String term : terms) {
                p = cb.and(p, cb.like(t, "%" + term.toLowerCase() + "%"));
            }
            return p;
        };
    }

    /**
     * Keep only the latest records per product/day according to your DWID or date columns.
     * If you already enforce freshness elsewhere, you can no-op this.
     */
    public static Specification<FactProductShoes> latestOnly() {
        // Placeholder: return conjunction. Wire in your actual "latest" logic if needed.
        return (root, query, cb) -> cb.conjunction();
    }

    /**
     * NEW: Filter sizes when sizes live in a stringified JSON inside the "extras" column:
     * {"sizes":["7","8","7.5"], ...}
     *
     * We use LIKE patterns that look for the quoted size tokens inside the JSON array
     * while minimizing false positives (e.g., "17" vs "7").
     */
    public static Specification<FactProductShoes> sizeAnyInExtrasTextJson(List<String> sizes) {
        return (root, query, cb) -> {
            if (sizes == null || sizes.isEmpty()) return cb.conjunction();

            // IMPORTANT: property name matches entity field
            Expression<String> extra = cb.lower(root.get("extra"));

            // must contain the "sizes" key first
            Predicate hasSizesKey = cb.like(extra, "%\"sizes\"%");

            List<Predicate> anySizePreds = new ArrayList<>();
            for (String s : sizes) {
                if (s == null) continue;
                String v = s.trim().toLowerCase(); // e.g., "7" or "7.5"

                // exact "7"
                String pStartExact = "%\"sizes\"%[\"" + v + "\"%";
                String pMidExact   = "%,\"" + v + "\"%";
                String pEndExact   = "%\"" + v + "\"]%";

                // variants with US either side; allow optional space: "7 us", "7us", "us 7", "us7"
                String vUsRightSp  = v + " us";
                String vUsRight    = v + "us";
                String vUsLeftSp   = "us " + v;
                String vUsLeft     = "us" + v;

                String pStartUsRSp = "%\"sizes\"%[\"" + vUsRightSp + "\"%";
                String pMidUsRSp   = "%,\"" + vUsRightSp + "\"%";
                String pEndUsRSp   = "%\"" + vUsRightSp + "\"]%";

                String pStartUsR   = "%\"sizes\"%[\"" + vUsRight + "\"%";
                String pMidUsR     = "%,\"" + vUsRight + "\"%";
                String pEndUsR     = "%\"" + vUsRight + "\"]%";

                String pStartUsLSp = "%\"sizes\"%[\"" + vUsLeftSp + "\"%";
                String pMidUsLSp   = "%,\"" + vUsLeftSp + "\"%";
                String pEndUsLSp   = "%\"" + vUsLeftSp + "\"]%";

                String pStartUsL   = "%\"sizes\"%[\"" + vUsLeft + "\"%";
                String pMidUsL     = "%,\"" + vUsLeft + "\"%";
                String pEndUsL     = "%\"" + vUsLeft + "\"]%";

                anySizePreds.add(cb.or(
                        cb.like(extra, pStartExact), cb.like(extra, pMidExact), cb.like(extra, pEndExact),
                        cb.like(extra, pStartUsRSp), cb.like(extra, pMidUsRSp), cb.like(extra, pEndUsRSp),
                        cb.like(extra, pStartUsR),   cb.like(extra, pMidUsR),   cb.like(extra, pEndUsR),
                        cb.like(extra, pStartUsLSp), cb.like(extra, pMidUsLSp), cb.like(extra, pEndUsLSp),
                        cb.like(extra, pStartUsL),   cb.like(extra, pMidUsL),   cb.like(extra, pEndUsL)
                ));
            }

            return cb.and(hasSizesKey, cb.or(anySizePreds.toArray(new Predicate[0])));
        };
    }
}
