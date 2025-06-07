package com.nimbly.phshoesbackend.service;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;


public interface FactProductShoesService {
    Page<FactProductShoes> fetchBySpec(Specification<FactProductShoes> spec, Pageable pageable);
    public Page<FactProductShoes> aiSearch(String nlQuery, Pageable pageable);
}
