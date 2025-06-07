package com.nimbly.phshoesbackend.service;

import com.nimbly.phshoesbackend.model.dto.FilterCriteria;

public interface OpenAiIntentParserService {
    public FilterCriteria parseIntent(String nlQuery);
}
