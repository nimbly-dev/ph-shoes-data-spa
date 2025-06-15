package com.nimbly.phshoesbackend.controller;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.repository.FactProductShoesRepository;
import com.nimbly.phshoesbackend.repository.specification.ProductShoesSpecifications;
import com.nimbly.phshoesbackend.service.FactProductShoesService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.HtmlUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/fact-product-shoes")
public class FactProductShoesController {

    private final FactProductShoesService service;

    public FactProductShoesController(FactProductShoesService service) {
        this.service = service;
    }

    @GetMapping
    public Page<FactProductShoes> fetchBySpec(
            @RequestParam Optional<String> brand,
            @RequestParam Optional<String> gender,
            @RequestParam Optional<String> ageGroup,
            @RequestParam(name = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> date,
            @RequestParam(name = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> startDate,
            @RequestParam(name = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> endDate,
            @RequestParam(name = "keyword", required = false) Optional<String> keyword,
            @RequestParam(name = "onSale", defaultValue = "false") boolean onSale,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        // start with a “true” predicate
        Specification<FactProductShoes> spec = (root, query, cb) -> cb.conjunction();

        // apply each filter with a simple if-check
        if (brand.isPresent()) {
            spec = spec.and(ProductShoesSpecifications.hasBrand(brand.get()));
        }
        if (gender.isPresent()) {
            spec = spec.and(ProductShoesSpecifications.hasGender(gender.get()));
        }
        if (ageGroup.isPresent()) {
            spec = spec.and(ProductShoesSpecifications.hasAgeGroup(ageGroup.get()));
        }
        if (date.isPresent()) {
            spec = spec.and(ProductShoesSpecifications.collectedOn(date.get()));
        } else if (startDate.isPresent() && endDate.isPresent()) {
            spec = spec.and(ProductShoesSpecifications.collectedBetween(
                    startDate.get(), endDate.get()
            ));
        }

        if (keyword.isPresent()) {
            spec = spec.and(ProductShoesSpecifications.hasKeyword(keyword.get()));
        }

        if (onSale) {
            spec = spec.and(ProductShoesSpecifications.isOnSale());
        }

        return service.fetchBySpec(spec, pageable);
    }

    /**
     * AI‐powered endpoint. Use GET /api/search?q=…&page=…&size=…
     */
    @GetMapping("/search")
    public Page<FactProductShoes> searchByAI(
            @RequestParam("q") String nlQuery,
            @PageableDefault(size = 15) Pageable pageable
    ) throws JsonProcessingException {
        // Reject disallowed raw chars
        if (nlQuery.contains("<") || nlQuery.contains(">") || nlQuery.contains("%") || nlQuery.contains(";")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Search query contains invalid characters."
            );
        }

        // Escape any stray HTML
        String escaped = HtmlUtils.htmlEscape(nlQuery);

        // Whitelist: only alnum, spaces, and . , ? ! - ’
        if (!escaped.matches("^[\\p{Alnum}\\s.,?!\\-’]+$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Search query contains invalid characters."
            );
        }
        return service.aiSearch(escaped, pageable);
    }
    @GetMapping("/latest")
    public List<FactProductShoesRepository.LatestData> latestByBrand() {
        return service.getLatestDataByBrand();
    }
}
