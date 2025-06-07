package com.nimbly.phshoesbackend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FilterCriteria {
    private String brand;
    private String model;
    private Double priceSaleMin;
    private Double priceSaleMax;
    private Double priceOriginalMin;
    private Double priceOriginalMax;
    private String gender;
    private Boolean onSale;
    private List<String> titleKeywords;
    private List<String> subtitleKeywords;
    private String sortBy;   // new: e.g. "price_desc" if user wants most expensive
}
