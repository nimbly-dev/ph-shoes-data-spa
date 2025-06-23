package com.nimbly.phshoesbackend.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbly.phshoesbackend.exception.AiSearchException;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class VectorUtils {
    private VectorUtils() {}

    public static String toJson(float[] vector, ObjectMapper mapper) {
        try {
            List<Float> boxed = IntStream.range(0, vector.length)
                    .mapToObj(i -> vector[i])
                    .collect(Collectors.toList());
            return mapper.writeValueAsString(boxed);
        } catch (JsonProcessingException e) {
            throw new AiSearchException(
                    "Failed to serialize embedding", e
            );
        }
    }
}
