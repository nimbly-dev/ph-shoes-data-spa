package com.nimbly.phshoesbackend.ai.pipeline;

import com.nimbly.phshoesbackend.model.dto.AISearchFilterCriteria;
import com.nimbly.phshoesbackend.service.OpenAiIntentParserService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
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

    public AISearchFilterCriteria process(String nlQuery) {
        // 1. deterministic extract
        AISearchFilterCriteria base = pre.extract(nlQuery);

        // 2. strip & fuzzy parse
        String leftover = pre.strip(nlQuery);
        AISearchFilterCriteria fuzzy = intent.parseIntent(leftover);

        // 3. merge base + fuzzy
        merge(base, fuzzy);

        // 4. normalize & validate
        FilterNormalizer.normalize(base);
        validator.validate(base);

        return base;
    }

    private void merge(AISearchFilterCriteria base, AISearchFilterCriteria fuzzy) {
        //  OR-clause for any brands AI detected
        if (fuzzy.getBrands() != null && !fuzzy.getBrands().isEmpty()) {
            base.setBrands(new ArrayList<>(fuzzy.getBrands()));
        }

        // Scalar overrides
        Optional.ofNullable(fuzzy.getGender())           .ifPresent(base::setGender);
        Optional.ofNullable(fuzzy.getPriceSaleMin())     .ifPresent(base::setPriceSaleMin);
        Optional.ofNullable(fuzzy.getPriceSaleMax())     .ifPresent(base::setPriceSaleMax);
        Optional.ofNullable(fuzzy.getPriceOriginalMin()) .ifPresent(base::setPriceOriginalMin);
        Optional.ofNullable(fuzzy.getPriceOriginalMax()) .ifPresent(base::setPriceOriginalMax);
        base.setOnSale(fuzzy.getOnSale());

        //  Price-sort shortcut: if AI wants a price sort, clear everything else
        String aiSort = fuzzy.getSortBy();
        if (StringUtils.hasText(aiSort)) {
            base.setSortBy(aiSort);
            base.setBrands(List.of());
            base.setModel(null);
            base.setTitleKeywords(List.of());
            base.setSubtitleKeywords(List.of());
            return;
        }

        // Carry over the raw model for phrase matching
        base.setModel(fuzzy.getModel());

        // Merge any free-form title keywords
        List<String> titleKeywords = new ArrayList<>();
        if (base.getTitleKeywords()   != null) titleKeywords.addAll(base.getTitleKeywords());
        if (fuzzy.getTitleKeywords()  != null) titleKeywords.addAll(fuzzy.getTitleKeywords());
        base.setTitleKeywords(titleKeywords);

        // Drop subtitle filters—let vector search or explicit UI handle categories
        base.setSubtitleKeywords(List.of());
    }



}
