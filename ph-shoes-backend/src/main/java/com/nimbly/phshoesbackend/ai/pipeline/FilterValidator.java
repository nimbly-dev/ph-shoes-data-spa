package com.nimbly.phshoesbackend.ai.pipeline;

import com.nimbly.phshoesbackend.exception.AiSearchException;
import com.nimbly.phshoesbackend.model.dto.AISearchFilterCriteria;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Slf4j
@Component
public class FilterValidator {

    private final PreFilterExtractor  preExtractor;

    public FilterValidator(
            PreFilterExtractor  preExtractor
    ) {
        this.preExtractor = preExtractor;
    }
    public void validate(AISearchFilterCriteria c) {
        List<String> brands = c.getBrands();
        if (brands != null) {
            for (String b : brands) {
                if (!preExtractor.isKnownBrand(b)) {
                    log.warn("Unknown brand in list: {}", b);
                    throw new AiSearchException("Unknown brand: " + b, null);
                }
            }
        }
        if (c.getPriceSaleMin() != null && c.getPriceSaleMin() < 0 ||
                c.getPriceSaleMax() != null && c.getPriceSaleMax() < 0) {
            log.warn("Negative priceSale filter");
            throw new AiSearchException("Negative priceSale filter", null);
        }
        if (c.getPriceSaleMin() != null && c.getPriceSaleMax() != null
                && c.getPriceSaleMin() > c.getPriceSaleMax()) {
            log.warn("priceSaleMin > priceSaleMax");
            throw new AiSearchException("priceSaleMin > priceSaleMax", null);
        }
        if (c.getSortBy() != null &&
                !Set.of("price_asc", "price_desc").contains(c.getSortBy())) {
            log.warn("Invalid sortBy: {}", c.getSortBy());
            throw new AiSearchException("Invalid sortBy: " + c.getSortBy(), null);
        }
        if (c.getGender() != null && !Set.of("male","female","unisex").contains(c.getGender())) {
            log.warn("Invalid gender: {}", c.getGender());
            throw new AiSearchException("Invalid gender: " + c.getGender(), null);
        }
        if (c.getTitleKeywords() == null)    c.setTitleKeywords(List.of());
        if (c.getSubtitleKeywords() == null) c.setSubtitleKeywords(List.of());
    }
}