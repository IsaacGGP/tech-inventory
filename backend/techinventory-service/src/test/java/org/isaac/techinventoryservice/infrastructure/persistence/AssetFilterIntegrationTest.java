package org.isaac.techinventoryservice.infrastructure.persistence;

import org.isaac.techinventoryservice.application.dto.AssetSearchCriteria;
import org.isaac.techinventoryservice.application.port.input.AssetUseCase;
import org.isaac.techinventoryservice.application.port.output.AssetRepositoryPort;
import org.isaac.techinventoryservice.application.port.output.CategoryRepositoryPort;
import org.isaac.techinventoryservice.domain.enums.AssetStatus;
import org.isaac.techinventoryservice.domain.model.Asset;
import org.isaac.techinventoryservice.domain.model.Category;
import org.isaac.techinventoryservice.infrastructure.persistence.repository.AssetJpaRepository;
import org.isaac.techinventoryservice.infrastructure.persistence.repository.CategoryJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class AssetFilterIntegrationTest {

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

    private Long laptopsId;
    private Long desktopsId;

    @BeforeEach
    void setUp() {
        assetJpaRepository.deleteAll();
        assetJpaRepository.flush();
        categoryJpaRepository.deleteAll();
        categoryJpaRepository.flush();

        Category laptops = categoryRepository.save(new Category("Laptops", "T5A"));
        Category desktops = categoryRepository.save(new Category("Desktops", "T5B"));
        laptopsId = laptops.getId();
        desktopsId = desktops.getId();

        assetRepository.save(newAsset("IT5-001", "SN-001", "Dell", "XPS", "800.00", AssetStatus.AVAILABLE, laptops));
        assetRepository.save(newAsset("IT5-002", "SN-002", "HP", "Pavilion", "1500.00", AssetStatus.ASSIGNED, laptops));
        assetRepository.save(newAsset("IT5-003", "SN-003", "Dell", "Inspiron", "3000.00", AssetStatus.MAINTENANCE, desktops));
        assetRepository.save(newAsset("IT5-004", "SN-004", "Lenovo", "ThinkCentre", "1200.00", AssetStatus.AVAILABLE, desktops));
    }

    @Test
    void filter_byCategoryId() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria(null, laptopsId, null, null, null), null, null);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).allMatch(a -> a.getCategory().getId().equals(laptopsId));
    }

    @Test
    void filter_byStatus() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria(null, null, AssetStatus.AVAILABLE, null, null), null, null);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).allMatch(a -> a.getStatus() == AssetStatus.AVAILABLE);
    }

    @Test
    void filter_byMinCost() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria(null, null, null, "1000", null), null, null);

        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent()).allMatch(a -> a.getAcquisitionCost().compareTo(new BigDecimal("1000")) >= 0);
    }

    @Test
    void filter_byMaxCost() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria(null, null, null, null, "1200"), null, null);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).allMatch(a -> a.getAcquisitionCost().compareTo(new BigDecimal("1200")) <= 0);
    }

    @Test
    void filter_byCostRange() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria(null, null, null, "800", "1500"), null, null);

        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent())
                .extracting(Asset::getInventoryFolio)
                .containsExactlyInAnyOrder("IT5-001", "IT5-002", "IT5-004");
    }

    @Test
    void filter_combinedCategoryAndStatus() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria(null, laptopsId, AssetStatus.AVAILABLE, null, null), null, null);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getInventoryFolio()).isEqualTo("IT5-001");
    }

    @Test
    void searchCombinedWithFilter() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria("dell", desktopsId, null, null, null), null, null);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getInventoryFolio()).isEqualTo("IT5-003");
    }

    @Test
    void filterCombinedWithPagination() {
        Page<Asset> result = assetUseCase.getAssets(0, 2, criteria(null, null, null, "1000", null), null, null);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(3);
        assertThat(result.getTotalPages()).isEqualTo(2);
    }

    @Test
    void filter_withNoResults_returnsEmptyPage() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria(null, laptopsId, AssetStatus.MAINTENANCE, null, null), null, null);

        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isZero();
    }

    @Test
    void optionalParameters_allNull_returnsAll() {
        List<Asset> result = assetRepository.searchAssets(criteria(null, null, null, null, null), Pageable.unpaged()).getContent();

        assertThat(result).hasSize(4);
    }

    private AssetSearchCriteria criteria(String search, Long categoryId, AssetStatus status,
                                         String minCost, String maxCost) {
        return new AssetSearchCriteria(
                search,
                categoryId,
                status,
                minCost == null ? null : new BigDecimal(minCost),
                maxCost == null ? null : new BigDecimal(maxCost)
        );
    }

    private Asset newAsset(String folio, String serial, String brand, String model,
                           String cost, AssetStatus status, Category category) {
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