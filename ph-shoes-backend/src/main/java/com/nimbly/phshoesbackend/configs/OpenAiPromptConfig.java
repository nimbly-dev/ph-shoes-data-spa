package com.nimbly.phshoesbackend.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class OpenAiPromptConfig {

    private final String promptTemplate;

    public OpenAiPromptConfig(
            @Value("classpath:ai/prompt-intent-parser.txt")
            Resource resource
    ) throws IOException {
        this.promptTemplate = Files.readString(Path.of(resource.getURI()));
    }

    /**
     * Injects the user’s query into the template.
     */
    public String getPromptFor(String userQuery) {
        return promptTemplate.replace("{QUERY}", userQuery.trim());
    }
}