package org.isaac.techinventoryservice.infrastructure.persistence;

import org.isaac.techinventoryservice.application.dto.AssetSearchCriteria;
import org.isaac.techinventoryservice.application.port.input.AssetUseCase;
import org.isaac.techinventoryservice.application.port.output.AssetRepositoryPort;
import org.isaac.techinventoryservice.application.port.output.CategoryRepositoryPort;
import org.isaac.techinventoryservice.domain.enums.AssetStatus;
import org.isaac.techinventoryservice.domain.exception.DomainException;
import org.isaac.techinventoryservice.domain.model.Asset;
import org.isaac.techinventoryservice.domain.model.Category;
import org.isaac.techinventoryservice.infrastructure.persistence.repository.AssetJpaRepository;
import org.isaac.techinventoryservice.infrastructure.persistence.repository.CategoryJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AssetSortIntegrationTest {

    @Autowired
    private AssetRepositoryPort assetRepository;

    @Autowired
    private CategoryRepositoryPort categoryRepository;

    @Autowired
    private AssetUseCase assetUseCase;

    @Autowired
    private AssetJpaRepository assetJpaRepository;

    @Autowired
    private CategoryJpaRepository categoryJpaRepository;

    @BeforeEach
    void setUp() {
        assetJpaRepository.deleteAll();
        assetJpaRepository.flush();
        categoryJpaRepository.deleteAll();
        categoryJpaRepository.flush();

        Category laptops = categoryRepository.save(new Category("Laptops", "T6A"));
        Category desktops = categoryRepository.save(new Category("Desktops", "T6B"));

        assetRepository.save(newAsset("IT6-001", "Zebra", "Model B", AssetStatus.AVAILABLE,
                "300.00", LocalDateTime.of(2026, 1, 1, 0, 0), laptops));
        assetRepository.save(newAsset("IT6-002", "Alpha", "Model A", AssetStatus.ASSIGNED,
                "100.00", LocalDateTime.of(2026, 3, 1, 0, 0), laptops));
        assetRepository.save(newAsset("IT6-003", "Mike", "Model C", AssetStatus.MAINTENANCE,
                "200.00", LocalDateTime.of(2026, 2, 1, 0, 0), desktops));
    }

    @Test
    void sortByBrand_ascending() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, null, "brand", "asc");

        assertThat(result.getContent())
                .extracting(Asset::getInventoryFolio)
                .containsExactly("IT6-002", "IT6-003", "IT6-001");
    }

    @Test
    void sortByBrand_descending() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, null, "brand", "desc");

        assertThat(result.getContent())
                .extracting(Asset::getInventoryFolio)
                .containsExactly("IT6-001", "IT6-003", "IT6-002");
    }

    @Test
    void sortByAcquisitionCost_ascending() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, null, "acquisitionCost", "asc");

        assertThat(result.getContent())
                .extracting(Asset::getInventoryFolio)
                .containsExactly("IT6-002", "IT6-003", "IT6-001");
    }

    @Test
    void sortByAcquisitionCost_descending() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, null, "acquisitionCost", "desc");

        assertThat(result.getContent())
                .extracting(Asset::getInventoryFolio)
                .containsExactly("IT6-001", "IT6-003", "IT6-002");
    }

    @Test
    void sortByEntryDate_descending() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, null, "entryDate", "desc");

        assertThat(result.getContent())
                .extracting(Asset::getInventoryFolio)
                .containsExactly("IT6-002", "IT6-003", "IT6-001");
    }

    @Test
    void withoutSortParams_usesDefaultInventoryFolioAscending() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, null, null, null);

        assertThat(result.getContent())
                .extracting(Asset::getInventoryFolio)
                .containsExactly("IT6-001", "IT6-002", "IT6-003");
    }

    @Test
    void sortCombinedWithSearchFiltersAndPagination() {
        AssetSearchCriteria criteria = new AssetSearchCriteria("IT6-0", null, null,
                new BigDecimal("150"), null);
        Page<Asset> result = assetUseCase.getAssets(0, 2, criteria, "brand", "desc");

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getTotalPages()).isEqualTo(1);
        assertThat(result.getContent())
                .extracting(Asset::getInventoryFolio)
                .containsExactly("IT6-001", "IT6-003");
    }

    @Test
    void sortBy_invalidField_throws() {
        assertThatThrownBy(() -> assetUseCase.getAssets(0, 10, null, "category", "asc"))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("Invalid sortBy field");
    }

    @Test
    void sortDirection_invalid_throws() {
        assertThatThrownBy(() -> assetUseCase.getAssets(0, 10, null, "brand", "sideways"))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("Invalid sortDirection");
    }

    private Asset newAsset(String folio, String brand, String model, AssetStatus status,
                           String cost, LocalDateTime entryDate, Category category) {
        return new Asset(
                UUID.randomUUID(),
                folio,
                "SN-SORT-" + folio,
                brand,
                model,
                status,
                new BigDecimal(cost),
                entryDate,
                category
        );
    }
}