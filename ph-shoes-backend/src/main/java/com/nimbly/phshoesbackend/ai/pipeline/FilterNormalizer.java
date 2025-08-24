package com.nimbly.phshoesbackend.ai.pipeline;

import com.nimbly.phshoesbackend.model.dto.AISearchFilterCriteria;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Normalizes fields (brands, gender, keywords, sizes, etc.) into canonical forms,
 * and disambiguates model numbers vs sizes when no explicit size cue is present.
 */
@Component
public class FilterNormalizer {

    public static void normalize(AISearchFilterCriteria c) {
        if (c == null) return;
        normalizeBrands(c);
        normalizeGender(c);
        normalizeKeywordLists(c);

        // Disambiguate BEFORE we strip unit prefixes / symbols in normalizeSizes(...)
        disambiguateSizeVsModel(c);

        // fix over-strict price fields from LLM or prefilter
        normalizePrices(c);

        normalizeSizes(c);
    }

    // ----------------- helpers -----------------
    private static void normalizeBrands(AISearchFilterCriteria c) {
        if (c.getBrands() == null) return;
        List<String> b = c.getBrands().stream()
                .filter(Objects::nonNull)
                .map(s -> s.trim().toLowerCase())
                .map(s -> s.replaceAll("\\s+", ""))        // "new balance" -> "newbalance"
                .filter(s -> !s.isBlank())
                .distinct()
                .collect(Collectors.toList());
        c.setBrands(b.isEmpty() ? null : b);
    }

    private static void normalizeGender(AISearchFilterCriteria c) {
        if (c.getGender() == null) return;
        String g = c.getGender().trim().toLowerCase();
        if (g.startsWith("m")) g = "male";
        else if (g.startsWith("f")) g = "female";
        else if (g.contains("kid")) g = "kids";
        else if (g.contains("uni")) g = "unisex";
        c.setGender(g);
    }

    private static void normalizeKeywordLists(AISearchFilterCriteria c) {
        if (c.getTitleKeywords() != null) {
            c.setTitleKeywords(c.getTitleKeywords().stream()
                    .filter(Objects::nonNull)
                    .map(s -> s.trim().toLowerCase())
                    .filter(s -> !s.isBlank())
                    .distinct()
                    .collect(Collectors.toList()));
            if (c.getTitleKeywords().isEmpty()) c.setTitleKeywords(null);
        }
        if (c.getSubtitleKeywords() != null) {
            c.setSubtitleKeywords(c.getSubtitleKeywords().stream()
                    .filter(Objects::nonNull)
                    .map(s -> s.trim().toLowerCase())
                    .filter(s -> !s.isBlank())
                    .distinct()
                    .collect(Collectors.toList()));
            if (c.getSubtitleKeywords().isEmpty()) c.setSubtitleKeywords(null);
        }
    }

    private static void normalizePrices(AISearchFilterCriteria c) {
        // ---- SALE price ----
        Double sMin = c.getPriceSaleMin();
        Double sMax = c.getPriceSaleMax();

        if (sMin != null && sMax != null) {
            if (Double.compare(sMin, sMax) == 0) {
                // Heuristic: treat "min==max" as an upper-bound (≤ X), not exact X
                // This repairs "under 8000" that got encoded as min=8000 & max=8000
                c.setPriceSaleMin(null);
            } else if (sMin > sMax) {
                // swap if accidentally inverted
                c.setPriceSaleMin(sMax);
                c.setPriceSaleMax(sMin);
            }
        }

        // ---- ORIGINAL price ----
        Double oMin = c.getPriceOriginalMin();
        Double oMax = c.getPriceOriginalMax();

        if (oMin != null && oMax != null) {
            if (Double.compare(oMin, oMax) == 0) {
                // same heuristic for original price (rarely intended to be exact)
                c.setPriceOriginalMin(null);
            } else if (oMin > oMax) {
                c.setPriceOriginalMin(oMax);
                c.setPriceOriginalMax(oMin);
            }
        }

        // If sale bounds exist, and original bounds mirror the same numbers,
        // drop the original bounds to avoid over-constraining.
        if (c.getPriceSaleMin() != null || c.getPriceSaleMax() != null) {
            if (Objects.equals(c.getPriceOriginalMin(), c.getPriceSaleMin())) c.setPriceOriginalMin(null);
            if (Objects.equals(c.getPriceOriginalMax(), c.getPriceSaleMax())) c.setPriceOriginalMax(null);
        }
    }


    /**
     * Disambiguate: if a size value also appears as a whole-word token inside the
     * model/title keywords and we don't see an "explicit size cue", drop sizes.
     *
     * Note: Since we don't have the raw query here, we infer cues from the parsed fields:
     *  - any size string that already includes a unit (e.g., "US 9", "eu 41", "uk 8.5")
     *  - any subtitle/title keyword containing unit tokens ("us", "eu", "uk", "size", "sizes")
     */
    private static void disambiguateSizeVsModel(AISearchFilterCriteria c) {
        List<String> sizes = c.getSizes();
        if (sizes == null || sizes.isEmpty()) return;

        String modelLc = Optional.ofNullable(c.getModel()).orElse("").toLowerCase();
        String titleKwLc = String.join(" ",
                Optional.ofNullable(c.getTitleKeywords()).orElse(List.of())
        ).toLowerCase();

        // Heuristic "explicit size cues" without raw query:
        //  1) a size token that includes a unit prefix
        //  2) subtitle/title keywords that include size/unit words
        boolean unitInSizes = sizes.stream()
                .filter(Objects::nonNull)
                .map(s -> s.toLowerCase().trim())
                .anyMatch(s -> s.matches("^(?:us|eu|uk)\\s*\\d+(?:\\.\\d+)?") || s.startsWith("size "));

        boolean cueInKeywords =
                containsCueTokens(c.getSubtitleKeywords()) || containsCueTokens(c.getTitleKeywords());

        boolean hasExplicitSizeCue = unitInSizes || cueInKeywords;

        // Does any size also appear as a whole word in model/title keywords?
        boolean overlapsModel = sizes.stream()
                .filter(Objects::nonNull)
                .map(s -> s.trim().toLowerCase())
                .filter(s -> !s.isEmpty())
                .anyMatch(s -> {
                    String boundary = "\\b" + Pattern.quote(s) + "\\b";
                    return Pattern.compile(boundary).matcher(modelLc).find()
                            || Pattern.compile(boundary).matcher(titleKwLc).find();
                });

        if (!hasExplicitSizeCue && overlapsModel) {
            // e.g., "clifton 9" → drop sizes=["9"]
            c.setSizes(null);
        }
    }

    private static boolean containsCueTokens(List<String> words) {
        if (words == null || words.isEmpty()) return false;
        for (String w : words) {
            if (w == null) continue;
            String s = w.toLowerCase();
            if (s.contains(" size ") || s.startsWith("size ")
                    || s.equals("size") || s.equals("sizes")
                    || s.contains(" us ") || s.startsWith("us ")
                    || s.contains(" eu ") || s.startsWith("eu ")
                    || s.contains(" uk ") || s.startsWith("uk ")) {
                return true;
            }
        }
        return false;
    }

    private static void normalizeSizes(AISearchFilterCriteria c) {
        if (c.getSizes() == null) return;
        List<String> s = c.getSizes().stream()
                .filter(Objects::nonNull)
                .map(x -> x.trim().toLowerCase())
                .map(x -> x.replaceAll("^(us|eu|uk)\\s*", "")) // strip unit prefixes
                .map(x -> x.replaceAll("[^0-9\\.]", ""))      // keep digits + dot
                .filter(x -> !x.isBlank())
                .distinct()
                .collect(Collectors.toList());
        c.setSizes(s.isEmpty() ? null : s);
    }
}
