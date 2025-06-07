package com.nimbly.phshoesbackend.model.dto;

import lombok.Data;

@Data
public class ShoeDto {
    private String id;
    private String brand;
    private String title;
    private String subtitle;
    private String image;
    private Double priceSale;
    private Double priceOriginal;
    private String gender;
    private String ageGroup;
    private Integer year;
    private Integer month;
    private Integer day;
}
