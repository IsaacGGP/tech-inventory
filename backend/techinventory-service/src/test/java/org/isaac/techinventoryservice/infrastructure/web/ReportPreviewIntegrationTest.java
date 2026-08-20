package org.isaac.techinventoryservice.infrastructure.web;

import org.isaac.techinventoryservice.application.port.output.AssetRepositoryPort;
import org.isaac.techinventoryservice.application.port.output.CategoryRepositoryPort;
import org.isaac.techinventoryservice.domain.enums.AssetStatus;
import org.isaac.techinventoryservice.domain.model.Asset;
import org.isaac.techinventoryservice.domain.model.Category;
import org.isaac.techinventoryservice.infrastructure.persistence.repository.AssetJpaRepository;
import org.isaac.techinventoryservice.infrastructure.persistence.repository.CategoryJpaRepository;
import org.isaac.techinventoryservice.infrastructure.security.jwt.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReportPreviewIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AssetRepositoryPort assetRepository;

    @Autowired
    private CategoryRepositoryPort categoryRepository;

    @Autowired
    private AssetJpaRepository assetJpaRepository;

    @Autowired
    private CategoryJpaRepository categoryJpaRepository;

    private Category laptops;
    private Category desktops;

    @BeforeEach
    void setUp() {
        assetJpaRepository.deleteAll();
        assetJpaRepository.flush();
        categoryJpaRepository.deleteAll();
        categoryJpaRepository.flush();

        laptops = categoryRepository.save(new Category("Laptops", "T7A"));
        desktops = categoryRepository.save(new Category("Desktops", "T7B"));

        assetRepository.save(newAsset("IT7-001", "SN-7-001", "Dell", "XPS 13",
                AssetStatus.AVAILABLE, "1500.00", laptops));
        assetRepository.save(newAsset("IT7-002", "SN-7-002", "Lenovo", "ThinkCentre",
                AssetStatus.ASSIGNED, "800.00", desktops));
    }

    @Test
    void preview_returns200WithAssets() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview").header("Authorization", bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assets", hasSize(2)))
                .andExpect(jsonPath("$.assets[*].inventoryFolio", containsInAnyOrder("IT7-001", "IT7-002")))
                .andExpect(jsonPath("$.assets[*].serialNumber", containsInAnyOrder("SN-7-001", "SN-7-002")))
                .andExpect(jsonPath("$.assets[*].brand", containsInAnyOrder("Dell", "Lenovo")))
                .andExpect(jsonPath("$.assets[*].model", containsInAnyOrder("XPS 13", "ThinkCentre")))
                .andExpect(jsonPath("$.assets[*].status", containsInAnyOrder("AVAILABLE", "ASSIGNED")))
                .andExpect(jsonPath("$.assets[*].acquisitionCost", everyItem(notNullValue())))
                .andExpect(jsonPath("$.assets[*].entryDate", everyItem(notNullValue())));
    }

    @Test
    void preview_returnsEmptyListWhenNoAssets() throws Exception {
        assetJpaRepository.deleteAll();
        assetJpaRepository.flush();

        mockMvc.perform(get("/api/v1/assets/report/preview").header("Authorization", bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assets", hasSize(0)))
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void preview_returnsTotalRecordCount() throws Exception {
        assetRepository.save(newAsset("IT7-003", "SN-7-003", "HP", "Pavilion",
                AssetStatus.MAINTENANCE, "1200.00", laptops));

        mockMvc.perform(get("/api/v1/assets/report/preview").header("Authorization", bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assets", hasSize(3)))
                .andExpect(jsonPath("$.totalElements").value(3));
    }

    @Test
    void preview_mapsCategoryName() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview").header("Authorization", bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assets[*].category", containsInAnyOrder("Laptops", "Desktops")))
                .andExpect(jsonPath("$.assets[0].id").doesNotExist())
                .andExpect(jsonPath("$.assets[0].prefixCode").doesNotExist())
                .andExpect(jsonPath("$.assets[0].technicalId").doesNotExist());
    }

    @Test
    void preview_withSearch_filtersAssets() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview")
                        .header("Authorization", bearerToken())
                        .param("search", "dell"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assets", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.assets[0].inventoryFolio").value("IT7-001"));
    }

    @Test
    void preview_withCategoryId_filtersAssets() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview")
                        .header("Authorization", bearerToken())
                        .param("categoryId", laptops.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assets", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.assets[0].inventoryFolio").value("IT7-001"));
    }

    @Test
    void preview_withStatus_filtersAssets() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview")
                        .header("Authorization", bearerToken())
                        .param("status", "ASSIGNED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assets", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.assets[0].inventoryFolio").value("IT7-002"));
    }

    @Test
    void preview_withMinCost_filtersAssets() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview")
                        .header("Authorization", bearerToken())
                        .param("minCost", "1000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assets", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.assets[0].inventoryFolio").value("IT7-001"));
    }

    @Test
    void preview_withMaxCost_filtersAssets() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview")
                        .header("Authorization", bearerToken())
                        .param("maxCost", "1000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assets", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.assets[0].inventoryFolio").value("IT7-002"));
    }

    @Test
    void preview_withCombinedFilters_filtersAssets() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview")
                        .header("Authorization", bearerToken())
                        .param("status", "AVAILABLE")
                        .param("categoryId", laptops.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assets", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.assets[0].inventoryFolio").value("IT7-001"));
    }

    @Test
    void preview_withNoMatchingResults_returnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview")
                        .header("Authorization", bearerToken())
                        .param("search", "nonexistent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assets", hasSize(0)))
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void preview_withNegativeMinCost_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview")
                        .header("Authorization", bearerToken())
                        .param("minCost", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("minCost must not be negative"));
    }

    @Test
    void preview_withNegativeMaxCost_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview")
                        .header("Authorization", bearerToken())
                        .param("maxCost", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("maxCost must not be negative"));
    }

    @Test
    void preview_withMinCostGreaterThanMaxCost_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview")
                        .header("Authorization", bearerToken())
                        .param("minCost", "2000")
                        .param("maxCost", "1000"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("minCost must not be greater than maxCost"));
    }

    @Test
    void report_withFilters_returns200WithZipMetadata() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report")
                        .header("Authorization", bearerToken())
                        .param("status", "AVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("assets.zip"))
                .andExpect(jsonPath("$.contentType").value("application/zip"))
                .andExpect(jsonPath("$.content").isNotEmpty());
    }

    @Test
    void report_withNegativeMinCost_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report")
                        .header("Authorization", bearerToken())
                        .param("minCost", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("minCost must not be negative"));
    }

    @Test
    void preview_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report/preview"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void report_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/assets/report"))
                .andExpect(status().isUnauthorized());
    }

    private String bearerToken() {
        return "Bearer " + jwtService.generateToken("testuser", "ADMIN");
    }

    private Asset newAsset(String folio, String serial, String brand, String model, AssetStatus status,
                           String cost, Category category) {
        return new Asset(
                UUID.randomUUID(),
                folio,
                serial,
                brand,
                model,
                status,
                new BigDecimal(cost),
                LocalDateTime.now(),
                category
        );
    }
}