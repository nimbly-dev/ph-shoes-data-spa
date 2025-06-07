package com.nimbly.phshoesbackend.controller;

import com.nimbly.phshoesbackend.model.FactProductShoes;
import com.nimbly.phshoesbackend.service.FactProductShoesService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class FactProductShoesControllerTest {

    private MockMvc mockMvc;

    @Mock
    private FactProductShoesService service;

    @InjectMocks
    private FactProductShoesController controller;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/fact-product-shoes → 200 + empty page JSON")
    void fetchBySpecEmpty() throws Exception {
        // return an empty page, preserving the incoming pageable
        when(service.fetchBySpec(any(), any(Pageable.class)))
                .thenAnswer(invocation -> {
                    Pageable p = invocation.getArgument(1, Pageable.class);
                    return Page.empty(p);
                });

        mockMvc.perform(get("/api/v1/fact-product-shoes")
                        .param("page", "0")
                        .param("size", "10")
                )
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.pageable.pageSize").value(10))
                .andExpect(jsonPath("$.pageable.pageNumber").value(0))
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @DisplayName("GET /api/v1/fact-product-shoes with filters → 200 + filtered JSON")
    void fetchBySpecWithFilters() throws Exception {
        // prepare a fake shoe
        FactProductShoes shoe = new FactProductShoes();
        shoe.setBrand("Nike");
        // stub the service to return a page with our single element
        when(service.fetchBySpec(any(), any(Pageable.class)))
                .thenAnswer(invocation -> {
                    Pageable p = invocation.getArgument(1, Pageable.class);
                    return new PageImpl<>(List.of(shoe), p, 1);
                });

        mockMvc.perform(get("/api/v1/fact-product-shoes")
                        .param("brand", "Nike")
                        .param("gender", "Men")
                        .param("page", "0")
                        .param("size", "5")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].brand").value("Nike"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/fact-product-shoes/search with invalid chars → 400")
    void searchByAI_invalidChars() throws Exception {
        mockMvc.perform(get("/api/v1/fact-product-shoes/search")
                        .param("q", "drop table;")
                )
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/v1/fact-product-shoes/search → 200 + empty page JSON")
    void searchByAI_empty() throws Exception {
        when(service.aiSearch(anyString(), any(Pageable.class)))
                .thenAnswer(invocation -> {
                    Pageable p = invocation.getArgument(1, Pageable.class);
                    return Page.empty(p);
                });

        mockMvc.perform(get("/api/v1/fact-product-shoes/search")
                        .param("q", "find running shoes")
                        .param("page", "1")
                        .param("size", "3")
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.pageable.pageNumber").value(1))
                .andExpect(jsonPath("$.pageable.pageSize").value(3));
    }

}
