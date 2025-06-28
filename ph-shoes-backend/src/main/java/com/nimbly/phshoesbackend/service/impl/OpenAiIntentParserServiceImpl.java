package com.nimbly.phshoesbackend.service.impl;

import com.nimbly.phshoesbackend.configs.OpenAiPromptConfig;
import com.nimbly.phshoesbackend.model.dto.FilterCriteria;
import com.nimbly.phshoesbackend.service.OpenAiIntentParserService;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.StructuredChatCompletionCreateParams;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OpenAiIntentParserServiceImpl implements OpenAiIntentParserService {

    private final OpenAIClient client;
    private final OpenAiPromptConfig promptConfig;

    public OpenAiIntentParserServiceImpl(
            OpenAiPromptConfig promptConfig
    ) {
        this.client = OpenAIOkHttpClient.fromEnv();
        this.promptConfig = promptConfig;
    }


    @Override
    public FilterCriteria parseIntent(String nlQuery) {
        String fullPrompt = promptConfig.getPromptFor(nlQuery);

        StructuredChatCompletionCreateParams<FilterCriteria> createParams =
                StructuredChatCompletionCreateParams.<FilterCriteria>builder()
                        .model(ChatModel.GPT_4_1_MINI)
                        .maxCompletionTokens(512)
                        .temperature(0.0)
                        .responseFormat(FilterCriteria.class)
                        .addUserMessage(fullPrompt)
                        .build();

        List<FilterCriteria> parsedList = client.chat()
                .completions()
                .create(createParams)
                .choices()
                .stream()
                .flatMap(choice -> choice.message().content().stream())
                .toList();

        FilterCriteria parsed = parsedList.isEmpty() ? new FilterCriteria() : parsedList.get(0);

        if (parsed.getBrand() != null && parsed.getBrand().isBlank()) {
            parsed.setBrand(null);
        }
        if (parsed.getModel() != null && parsed.getModel().isBlank()) {
            parsed.setModel(null);
        }
        if (parsed.getGender() != null && parsed.getGender().isBlank()) {
            parsed.setGender(null);
        }
        if (parsed.getTitleKeywords() != null && parsed.getTitleKeywords().isEmpty()) {
            parsed.setTitleKeywords(null);
        }
        if (parsed.getSubtitleKeywords() != null && parsed.getSubtitleKeywords().isEmpty()) {
            parsed.setSubtitleKeywords(null);
        }

        if (parsed.getPriceSaleMin() != null && parsed.getPriceSaleMin() == 0.0) {
            parsed.setPriceSaleMin(null);
        }
        if (parsed.getPriceSaleMax() != null && parsed.getPriceSaleMax() == 0.0) {
            parsed.setPriceSaleMax(null);
        }
        if (parsed.getPriceOriginalMin() != null && parsed.getPriceOriginalMin() == 0.0) {
            parsed.setPriceOriginalMin(null);
        }
        if (parsed.getPriceOriginalMax() != null && parsed.getPriceOriginalMax() == 0.0) {
            parsed.setPriceOriginalMax(null);
        }

        return parsed;
    }
}
