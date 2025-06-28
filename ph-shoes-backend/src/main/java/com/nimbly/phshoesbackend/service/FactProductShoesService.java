package com.nimbly.phshoesbackend.service;

import com.nimbly.phshoesbackend.exception.AiSearchException;
import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.repository.FactProductShoesRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;


public interface FactProductShoesService {
    Page<FactProductShoes> fetchBySpec(Specification<FactProductShoes> spec, Pageable pageable);
    public Page<FactProductShoes> aiSearch(String nlQuery, Pageable pageable) throws AiSearchException;
    public List<FactProductShoesRepository.LatestData> getLatestDataByBrand();
}
