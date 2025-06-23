package com.nimbly.phshoesbackend.util;


import com.nimbly.phshoesbackend.model.dto.FilterCriteria;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class PreFilterExtractorUtils {
    private static final Set<String> BRANDS = Set.of(
            "nike","adidas","newbalance","asics","worldbalance","hoka"
    );
    private static final Pattern UNDER = Pattern.compile("\\b(?:under|below)\\s*(\\d+)", Pattern.CASE_INSENSITIVE);
    private static final Pattern OVER  = Pattern.compile("\\b(?:over|above)\\s*(\\d+)", Pattern.CASE_INSENSITIVE);

    public FilterCriteria extract(String q) {
        String lower = q.toLowerCase();
        FilterCriteria c = new FilterCriteria();

        // brand
        for (String b : BRANDS) if (lower.contains(b)) { c.setBrand(b); break; }

        // onSale
        c.setOnSale(lower.contains("on sale"));

        // priceSaleMax / priceSaleMin
        Matcher m = UNDER.matcher(lower);
        if (m.find()) c.setPriceSaleMax(Double.valueOf(m.group(1)));
        m = OVER.matcher(lower);
        if (m.find()) c.setPriceSaleMin(Double.valueOf(m.group(1)));

        // sortBy
        if (lower.matches(".*\\b(cheapest|lowest)\\b.*"))        c.setSortBy("price_asc");
        else if (lower.matches(".*\\b(most expensive|highest price)\\b.*")) c.setSortBy("price_desc");

        return c;
    }

    public String strip(String q) {
        String out = q;
        // strip brands
        for (String b : BRANDS) {
            out = out.replaceAll("(?i)\\b" + Pattern.quote(b) + "\\b", "");
        }
        // strip price words & sort words
        out = out.replaceAll("(?i)\\b(on sale|under|below|over|above|cheapest|lowest|most expensive|highest price)\\b", "");
        return out.trim().replaceAll("\\s{2,}", " ");
    }
}
