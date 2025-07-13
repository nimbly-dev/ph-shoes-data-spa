package com.nimbly.phshoesbackend.ai.pipeline;

import com.nimbly.phshoesbackend.model.dto.FilterCriteria;
import com.nimbly.phshoesbackend.service.OpenAiIntentParserService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Component
public class FilterPipeline {
    private final PreFilterExtractor pre;
    private final OpenAiIntentParserService intent;
    private final FilterNormalizer normalizer;
    private final FilterValidator validator;

    public FilterPipeline(
            PreFilterExtractor pre,
            OpenAiIntentParserService intent,
            FilterNormalizer normalizer,
            FilterValidator validator
    ) {
        this.pre        = pre;
        this.intent     = intent;
        this.normalizer = normalizer;
        this.validator  = validator;
    }

    public FilterCriteria process(String nlQuery) {
        // 1. deterministic extract
        FilterCriteria base = pre.extract(nlQuery);

        // 2. strip & fuzzy parse
        String leftover = pre.strip(nlQuery);
        FilterCriteria fuzzy = intent.parseIntent(leftover);

        // 3. merge base + fuzzy
        merge(base, fuzzy);

        // 4. normalize & validate
        FilterNormalizer.normalize(base);
        validator.validate(base);

        return base;
    }

    private void merge(FilterCriteria base, FilterCriteria fuzzy) {
        // override any non-null scalar fields
        Optional.ofNullable(fuzzy.getBrand())          .ifPresent(base::setBrand);
        Optional.ofNullable(fuzzy.getModel())          .ifPresent(base::setModel);
        Optional.ofNullable(fuzzy.getGender())         .ifPresent(base::setGender);
        Optional.ofNullable(fuzzy.getPriceSaleMin())   .ifPresent(base::setPriceSaleMin);
        Optional.ofNullable(fuzzy.getPriceSaleMax())   .ifPresent(base::setPriceSaleMax);
        Optional.ofNullable(fuzzy.getPriceOriginalMin()).ifPresent(base::setPriceOriginalMin);
        Optional.ofNullable(fuzzy.getPriceOriginalMax()).ifPresent(base::setPriceOriginalMax);

        // boolean field
        base.setOnSale(fuzzy.getOnSale());

        // copy over ANY keyword filters
        base.setTitleKeywords   (fuzzy.getTitleKeywords());
        base.setSubtitleKeywords(fuzzy.getSubtitleKeywords());

        // preserve AI‐inferred sort if provided
        if (StringUtils.hasText(fuzzy.getSortBy())) {
            base.setSortBy(fuzzy.getSortBy());
        }
    }
}
