package com.nimbly.phshoesbackend.service;

import com.nimbly.phshoesbackend.model.dto.AISearchFilterCriteria;

public interface OpenAiIntentParserService {
    public AISearchFilterCriteria parseIntent(String nlQuery);
}
