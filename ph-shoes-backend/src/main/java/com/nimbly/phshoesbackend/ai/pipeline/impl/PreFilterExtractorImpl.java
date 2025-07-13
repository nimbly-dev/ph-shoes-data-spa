package com.nimbly.phshoesbackend.ai.pipeline.impl;

import com.nimbly.phshoesbackend.ai.pipeline.PreFilterExtractor;
import com.nimbly.phshoesbackend.model.dto.FilterCriteria;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class PreFilterExtractorImpl implements PreFilterExtractor {
    private static final Set<String> BRANDS = Set.of(
            "nike","adidas","newbalance","asics","worldbalance","hoka"
    );
    private static final Pattern UNDER = Pattern.compile("\\b(?:under|below)\\s*(\\d+)", Pattern.CASE_INSENSITIVE);
    private static final Pattern OVER  = Pattern.compile("\\b(?:over|above)\\s*(\\d+)", Pattern.CASE_INSENSITIVE);

    @Override
    public FilterCriteria extract(String q) {
        String lower = q.toLowerCase();
        FilterCriteria c = new FilterCriteria();

        for (String b : BRANDS) {
            if (lower.contains(b)) { c.setBrand(b); break; }
        }
        c.setOnSale(lower.contains("on sale"));

        Matcher m = UNDER.matcher(lower);
        if (m.find()) c.setPriceSaleMax(Double.valueOf(m.group(1)));
        m = OVER.matcher(lower);
        if (m.find()) c.setPriceSaleMin(Double.valueOf(m.group(1)));

        if (lower.matches(".*\\b(cheapest|lowest)\\b.*"))       c.setSortBy("price_asc");
        else if (lower.matches(".*\\b(most expensive|highest price)\\b.*"))
            c.setSortBy("price_desc");

        return c;
    }

    @Override
    public String strip(String q) {
        String out = q;
        for (String b : BRANDS) {
            out = out.replaceAll("(?i)\\b" + Pattern.quote(b) + "\\b", "");
        }
        out = out.replaceAll(
                "(?i)\\b(on sale|under|below|over|above|cheapest|lowest|most expensive|highest price)\\b",
                ""
        );
        return out.trim().replaceAll("\\s{2,}", " ");
    }

    @Override
    public boolean isKnownBrand(String brand) {
        return brand != null && BRANDS.contains(brand.toLowerCase());
    }
}