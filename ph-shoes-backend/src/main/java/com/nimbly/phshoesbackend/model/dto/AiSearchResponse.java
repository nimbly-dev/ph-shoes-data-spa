package com.nimbly.phshoesbackend.model.dto;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiSearchResponse {
    private AISearchFilterCriteria filter;
    private Page<FactProductShoes> results;
}