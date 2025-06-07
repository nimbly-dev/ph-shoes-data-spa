package com.nimbly.phshoesbackend.service.impl;

import com.nimbly.phshoesbackend.service.OpenAiEmbeddingService;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.embeddings.CreateEmbeddingResponse;
import com.openai.models.embeddings.EmbeddingCreateParams;
import com.openai.models.embeddings.EmbeddingModel;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OpenAiEmbeddingServiceImpl implements OpenAiEmbeddingService {

    private final OpenAIClient client;
    private final String embeddingModel = "text-embedding-ada-002";

    public OpenAiEmbeddingServiceImpl() {
        this.client = OpenAIOkHttpClient.fromEnv();
    }

    @Override
    public float[] embed(String nlQuery) {
        EmbeddingCreateParams createParams = EmbeddingCreateParams.builder()
                .input(nlQuery)
                .model(EmbeddingModel.TEXT_EMBEDDING_ADA_002)
                .build();

        CreateEmbeddingResponse response = client.embeddings().create(createParams);
        List<Double> vectorList = response.data().get(0).embedding();
        float[] vector = new float[vectorList.size()];
        for (int i = 0; i < vectorList.size(); i++) {
            vector[i] = vectorList.get(i).floatValue();
        }
        return vector;
    }
}
