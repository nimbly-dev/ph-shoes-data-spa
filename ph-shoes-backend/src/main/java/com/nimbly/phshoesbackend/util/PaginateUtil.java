package com.nimbly.phshoesbackend.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.model.EmbeddingFactProductShoes;
import com.nimbly.phshoesbackend.repository.jpa.EmbeddingFactProductShoesRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class PaginateUtil {

    private final EmbeddingFactProductShoesRepository embedRepo;
    private final ObjectMapper objectMapper;

    public PaginateUtil(EmbeddingFactProductShoesRepository embedRepo,
                        ObjectMapper objectMapper) {
        this.embedRepo     = embedRepo;
        this.objectMapper = objectMapper;
    }

    /**
     * 1) Pull embeddings for every candidate
     * 2) Parse the JSON‐string into float[]
     * 3) Compute cosine similarity vs. queryVector
     * 4) Sort descending
     * 5) Slice out the requested page
     */
    public Page<FactProductShoes> paginateByVectorScore(
            List<FactProductShoes> candidates,
            float[] queryVector,
            Pageable pageable
    ) {
        if (candidates.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        // 1) extract all shoe IDs (match EmbeddingFactProductShoes.id)
        List<String> ids = candidates.stream()
                .map(fps -> fps.getKey().getId())
                .collect(Collectors.toList());

        // 2) fetch all embeddings in one go
        List<EmbeddingFactProductShoes> rows = embedRepo.findAllById(ids);

        // 3) parse JSON→float[]
        Map<String, float[]> embMap = new HashMap<>();
        for (EmbeddingFactProductShoes row : rows) {
            try {
                float[] vec = objectMapper.readValue(row.getEmbedding(), float[].class);
                embMap.put(row.getId(), vec);
            } catch (JsonProcessingException e) {
                // you might log this; skip any bad rows
            }
        }

        // 4) score + sort
        List<Scored> scored = candidates.stream()
                .map(shoe -> {
                    String id = shoe.getKey().getId();
                    float[] emb = embMap.get(id);
                    double score = (emb != null)
                            ? cosine(queryVector, emb)
                            : 0.0;
                    return new Scored(shoe, score);
                })
                .sorted(Comparator.comparingDouble(Scored::score).reversed())
                .collect(Collectors.toList());

        // 5) page‐slice
        int total = scored.size();
        int start = (int)pageable.getOffset();
        int end   = Math.min(start + pageable.getPageSize(), total);

        List<FactProductShoes> pageContent = scored.subList(start, end).stream()
                .map(Scored::shoe)
                .collect(Collectors.toList());

        return new PageImpl<>(pageContent, pageable, total);
    }

    private double cosine(float[] a, float[] b) {
        double dot = 0, magA = 0, magB = 0;
        for (int i = 0; i < a.length; i++) {
            dot  += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        return dot / (Math.sqrt(magA) * Math.sqrt(magB) + 1e-10);
    }

    private record Scored(FactProductShoes shoe, double score) {}
}
