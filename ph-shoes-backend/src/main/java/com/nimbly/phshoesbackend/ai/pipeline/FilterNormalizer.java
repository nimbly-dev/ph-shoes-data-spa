package com.nimbly.phshoesbackend.ai.pipeline;

import com.nimbly.phshoesbackend.model.dto.FilterCriteria;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class FilterNormalizer {

    /**
     * Apply all trivial, deterministic normalizations to a FilterCriteria:
     *  - “men”/“men's” → “male”; “women”/“women's” → “female”
     *  - If gender=”kids” or “children” → move “kids” into subtitleKeywords (leave gender=null)
     *  - Strip spaces/punctuation from multiword brands and lowercase them
     *
     * You can add more rules here if needed.
     */
    public static void normalize(FilterCriteria criteria) {
        if (criteria == null) {
            return;
        }

        normalizeGender(criteria);
        normalizeKidsAsSubtitle(criteria);
        normalizeBrand(criteria);
    }

    private static void normalizeGender(FilterCriteria c) {
        String g = c.getGender();
        if (g == null) {
            return;
        }

        String raw = g.trim().toLowerCase();
        switch (raw) {
            case "men":
            case "men's":
            case "mens":
                c.setGender("male");
                break;

            case "women":
            case "women's":
            case "womens":
                c.setGender("female");
                break;

            default:
                c.setGender(raw);
        }
    }

    private static void normalizeKidsAsSubtitle(FilterCriteria c) {
        String g = c.getGender();
        if (g == null) {
            return;
        }

        String raw = g.trim().toLowerCase();
        if (raw.equals("kids") || raw.equals("child") || raw.equals("children")) {
            c.setGender(null);

            List<String> subs = c.getSubtitleKeywords();
            if (subs == null) {
                subs = new ArrayList<>();
            }
            if (!subs.contains("kids")) {
                subs.add("kids");
            }
            c.setSubtitleKeywords(subs);
        }
    }

    private static void normalizeBrand(FilterCriteria c) {
        String b = c.getBrand();
        if (b == null) {
            return;
        }
        String cleaned = b.trim().toLowerCase().replaceAll("[^a-z0-9]+", "");
        c.setBrand(cleaned);
    }
}
