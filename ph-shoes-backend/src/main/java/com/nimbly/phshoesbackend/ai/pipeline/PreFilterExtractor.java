package com.nimbly.phshoesbackend.ai.pipeline;

import com.nimbly.phshoesbackend.model.dto.FilterCriteria;


public interface PreFilterExtractor {
    FilterCriteria extract(String nlQuery);
    String strip(String nlQuery);
    boolean isKnownBrand(String brand);
}
