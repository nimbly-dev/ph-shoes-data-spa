package com.nimbly.phshoesbackend.model;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(
        name = "FACT_PRODUCT_SHOES",
        schema = "PRODUCTION_MARTS",
        catalog = "PH_SHOES_DB"
)
@Data
public class FactProductShoes {

    //Composite key dwid + id
    @EmbeddedId
    @JsonUnwrapped
    private FactProductShoesId key;

    @Column(name = "BRAND", length = 16777216)
    private String brand;

    @Column(name = "YEAR")
    private Integer year;

    @Column(name = "MONTH")
    private Integer month;

    @Column(name = "DAY")
    private Integer day;

    @Column(name = "TITLE", length = 16777216)
    private String title;

    @Column(name = "SUBTITLE", length = 16777216)
    private String subtitle;

    @Column(name = "URL", length = 16777216)
    private String url;

    @Column(name = "IMAGE", length = 16777216)
    private String image;

    @Column(name = "PRICE_SALE")
    private Double priceSale;

    @Column(name = "PRICE_ORIGINAL")
    private Double priceOriginal;

    @Column(name = "GENDER", length = 16777216)
    private String gender;

    @Column(name = "AGE_GROUP", length = 16777216)
    private String ageGroup;

    @Column(name = "EXTRA", columnDefinition = "VARIANT")
    private String extra;
}
