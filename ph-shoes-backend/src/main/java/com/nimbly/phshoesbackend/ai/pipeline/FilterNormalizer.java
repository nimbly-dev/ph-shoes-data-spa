package com.nimbly.phshoesbackend.ai.pipeline;

import com.nimbly.phshoesbackend.model.dto.AISearchFilterCriteria;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Normalizes fields (brands, gender, keywords, sizes, etc.) into canonical forms.
 */
@Component
public class FilterNormalizer {

    public static void normalize(AISearchFilterCriteria c) {
        if (c == null) return;
        normalizeBrands(c);
        normalizeGender(c);
        normalizeKeywordLists(c);
        normalizeSizes(c);
    }

    private static void normalizeBrands(AISearchFilterCriteria c) {
        if (c.getBrands() == null) return;
        List<String> b = c.getBrands().stream()
                .filter(Objects::nonNull)
                .map(s -> s.trim().toLowerCase().replaceAll("\\s+", "")) // "new balance" -> "newbalance"
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

    private static void normalizeSizes(AISearchFilterCriteria c) {
        if (c.getSizes() == null) return;
        List<String> s = c.getSizes().stream()
                .filter(Objects::nonNull)
                .map(x -> x.trim().toLowerCase())
                .map(x -> x.replaceAll("^(us|eu|uk)\\s*", ""))
                .map(x -> x.replaceAll("[^0-9\\.]", ""))
                .filter(x -> !x.isBlank())
                .distinct()
                .collect(Collectors.toList());
        c.setSizes(s.isEmpty() ? null : s);
    }
}
