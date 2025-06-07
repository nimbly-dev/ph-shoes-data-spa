package com.nimbly.phshoesbackend.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbly.phshoesbackend.model.EmbeddingFactProductShoes;
import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.repository.EmbeddingFactProductShoesRepository;
import com.nimbly.phshoesbackend.service.OpenAiEmbeddingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class FactProductShoesPaginateUtil {

    private final ObjectMapper objectMapper;

    public FactProductShoesPaginateUtil(ObjectMapper objectMapper){
        this.objectMapper = objectMapper;
    }

    public Page<FactProductShoes> paginateByPriceDesc(
            List<FactProductShoes> list,
            Pageable pageable
    ) {
        // Sort in place by sale price descending
        list.sort(Comparator.comparing(FactProductShoes::getPriceSale).reversed());
        return sublistAsPage(list, pageable);
    }

    public Page<FactProductShoes> paginateByVectorScore(
            List<FactProductShoes> filtered,
            String nlQuery,
            Pageable pageable,
            OpenAiEmbeddingService embeddingService,
            EmbeddingFactProductShoesRepository embeddingRepo
    ) {
        List<String> ids = filtered.stream()
                .map(fp -> fp.getKey().getId())
                .toList();

        List<EmbeddingFactProductShoes> rows = embeddingRepo.findByIdIn(ids);
        Map<String, String> idToJson = rows.stream()
                .collect(Collectors.toMap(EmbeddingFactProductShoes::getId, EmbeddingFactProductShoes::getEmbedding));

        float[] queryVec = embeddingService.embed(nlQuery);

        List<ScoredShoe> scored = new ArrayList<>(filtered.size());
        for (FactProductShoes shoe : filtered) {
            String id = shoe.getKey().getId();
            float[] productVec = parseJsonToFloatArray(idToJson.get(id));
            double score = cosineSimilarity(queryVec, productVec);
            scored.add(new ScoredShoe(shoe, score));
        }

        scored.sort((a, b) -> Double.compare(b.score, a.score));

        List<FactProductShoes> ordered = scored.stream()
                .map(s -> s.shoe)
                .toList();

        return sublistAsPage(ordered, pageable);
    }

    /**
     * Simple helper for pairing a shoe with its similarity score.
     */
    private static class ScoredShoe {
        private final FactProductShoes shoe;
        private final double score;

        ScoredShoe(FactProductShoes shoe, double score) {
            this.shoe = shoe;
            this.score = score;
        }
    }

    private <T> Page<T> sublistAsPage(List<T> all, Pageable pageable) {
        int total = all.size();
        int pageSize = pageable.getPageSize();
        int pageNum = pageable.getPageNumber();
        int start = pageNum * pageSize;
        if (start >= total) {
            return new PageImpl<>(List.of(), pageable, total);
        }
        int end = Math.min(start + pageSize, total);
        List<T> slice = all.subList(start, end);
        return new PageImpl<>(slice, pageable, total);
    }

    private double cosineSimilarity(float[] a, float[] b) {
        if (a == null || b == null || a.length != b.length || a.length == 0) {
            return -1.0;
        }
        double dot = 0.0, normA = 0.0, normB = 0.0;
        for (int i = 0; i < a.length; i++) {
            dot += (double) a[i] * b[i];
            normA += (double) a[i] * a[i];
            normB += (double) b[i] * b[i];
        }
        if (normA == 0.0 || normB == 0.0) {
            return -1.0;
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private float[] parseJsonToFloatArray(String jsonArray) {
        if (jsonArray == null) {
            return new float[0];
        }
        try {
            List<Double> dbls = objectMapper.readValue(
                    jsonArray,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Double.class)
            );
            float[] arr = new float[dbls.size()];
            for (int i = 0; i < dbls.size(); i++) {
                arr[i] = dbls.get(i).floatValue();
            }
            return arr;
        } catch (IOException ex) {
            // If parsing fails, return an empty vector (score = –1)
            return new float[0];
        }
    }

}
