package org.isaac.techinventoryservice.infrastructure.web;

import org.isaac.techinventoryservice.application.port.output.CategoryRepositoryPort;
import org.isaac.techinventoryservice.domain.model.Category;
import org.isaac.techinventoryservice.infrastructure.persistence.repository.CategoryJpaRepository;
import org.isaac.techinventoryservice.infrastructure.security.jwt.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class GlobalExceptionHandlerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CategoryRepositoryPort categoryRepository;

    @Autowired
    private CategoryJpaRepository categoryJpaRepository;

    private final List<Long> createdCategoryIds = new ArrayList<>();

    private String token;

    @BeforeEach
    void setUp() {
        token = "Bearer " + jwtService.generateToken("testuser", "ADMIN");
    }

    @AfterEach
    void tearDown() {
        for (Long id : createdCategoryIds) {
            categoryJpaRepository.deleteById(id);
        }
        createdCategoryIds.clear();
    }

    @Test
    void resourceNotFound_returns404WithErrorResponse() throws Exception {
        mockMvc.perform(get("/api/v1/categories/99999999").header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Category not found with id: 99999999"))
                .andExpect(jsonPath("$.path").value("/api/v1/categories/99999999"));
    }

    @Test
    void dataIntegrityViolation_returns409WithErrorResponse() throws Exception {
        Category category = categoryRepository.save(new Category("Laptops", "T9A"));
        createdCategoryIds.add(category.getId());

        mockMvc.perform(post("/api/v1/categories")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Laptops 2\",\"prefixCode\":\"T9A\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Data integrity violation"))
                .andExpect(jsonPath("$.path").value("/api/v1/categories"));
    }

    @Test
    void validationError_returns400WithErrorResponse() throws Exception {
        mockMvc.perform(post("/api/v1/categories")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.path").value("/api/v1/categories"));
    }

    @Test
    void domainException_returns400WithErrorResponse() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview")
                        .header("Authorization", token)
                        .param("minCost", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("minCost must not be negative"))
                .andExpect(jsonPath("$.path").value("/api/v1/assets/report/preview"));
    }
}