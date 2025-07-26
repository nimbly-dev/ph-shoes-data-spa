package com.nimbly.phshoesbackend.ai.pipeline;

import com.nimbly.phshoesbackend.model.dto.AISearchFilterCriteria;


public interface PreFilterExtractor {
    AISearchFilterCriteria extract(String nlQuery);
    String strip(String nlQuery);
    boolean isKnownBrand(String brand);
}
