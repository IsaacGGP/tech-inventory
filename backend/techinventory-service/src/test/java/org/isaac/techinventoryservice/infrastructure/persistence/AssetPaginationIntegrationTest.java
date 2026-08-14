package org.isaac.techinventoryservice.infrastructure.persistence;

import org.isaac.techinventoryservice.application.dto.AssetSearchCriteria;
import org.isaac.techinventoryservice.application.port.input.AssetUseCase;
import org.isaac.techinventoryservice.application.port.output.AssetRepositoryPort;
import org.isaac.techinventoryservice.application.port.output.CategoryRepositoryPort;
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
import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class AssetPaginationIntegrationTest {

    private static final int TOTAL = 25;
    private static final int DELL_COUNT = 15;

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

        Category category = categoryRepository.save(new Category("Equipos", "EQ1"));

        IntStream.rangeClosed(1, TOTAL).forEach(i -> {
            String brand = i <= DELL_COUNT ? "Dell" : "HP";
            assetRepository.save(newAsset("PAG-" + String.format("%03d", i),
                    "SN-PAG-" + String.format("%03d", i), brand, "Model " + i, category));
        });
    }

    @Test
    void firstPage_withSize10_returnsFirstTenSortedByFolio() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria("PAG-"), null, null);

        assertThat(result.getPageable().getPageNumber()).isEqualTo(0);
        assertThat(result.getSize()).isEqualTo(10);
        assertThat(result.getContent()).hasSize(10);
        assertThat(result.getTotalElements()).isEqualTo(TOTAL);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getContent().get(0).getInventoryFolio()).isEqualTo("PAG-001");
        assertThat(result.getContent().get(9).getInventoryFolio()).isEqualTo("PAG-010");
    }

    @Test
    void secondPage_returnsNextTen() {
        Page<Asset> result = assetUseCase.getAssets(1, 10, criteria("PAG-"), null, null);

        assertThat(result.getContent()).hasSize(10);
        assertThat(result.getTotalElements()).isEqualTo(TOTAL);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getContent().get(0).getInventoryFolio()).isEqualTo("PAG-011");
        assertThat(result.getContent().get(9).getInventoryFolio()).isEqualTo("PAG-020");
    }

    @Test
    void lastPage_returnsRemainingElements() {
        Page<Asset> result = assetUseCase.getAssets(2, 10, criteria("PAG-"), null, null);

        assertThat(result.getContent()).hasSize(5);
        assertThat(result.getTotalElements()).isEqualTo(TOTAL);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getContent().get(0).getInventoryFolio()).isEqualTo("PAG-021");
    }

    @Test
    void pageOutOfRange_returnsEmptyContentWithCoherentMetadata() {
        Page<Asset> result = assetUseCase.getAssets(10, 10, criteria("PAG-"), null, null);

        assertThat(result.getContent()).isEmpty();
        assertThat(result.getPageable().getPageNumber()).isEqualTo(10);
        assertThat(result.getSize()).isEqualTo(10);
        assertThat(result.getTotalElements()).isEqualTo(TOTAL);
        assertThat(result.getTotalPages()).isEqualTo(3);
    }

    @Test
    void searchCombinedWithPagination() {
        Page<Asset> result = assetUseCase.getAssets(0, 5, criteria("dell"), null, null);

        assertThat(result.getContent()).hasSize(5);
        assertThat(result.getTotalElements()).isEqualTo(DELL_COUNT);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getContent()).allMatch(a -> a.getBrand().equalsIgnoreCase("dell"));
    }

    @Test
    void searchWithoutResults_returnsEmptyPage() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria("nonexistent-term"), null, null);

        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isZero();
        assertThat(result.getTotalPages()).isZero();
    }

    @Test
    void emptySearch_behavesAsPagedListing() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria(""), null, null);

        assertThat(result.getContent()).hasSize(10);
        assertThat(result.getTotalElements()).isEqualTo(TOTAL);
        assertThat(result.getTotalPages()).isEqualTo(3);
    }

    @Test
    void blankSearch_behavesAsPagedListing() {
        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria("   "), null, null);

        assertThat(result.getContent()).hasSize(10);
        assertThat(result.getTotalElements()).isEqualTo(TOTAL);
        assertThat(result.getTotalPages()).isEqualTo(3);
    }

    private AssetSearchCriteria criteria(String search) {
        return new AssetSearchCriteria(search, null, null, null, null);
    }

    private Asset newAsset(String folio, String serial, String brand, String model, Category category) {
        return new Asset(
                folio,
                serial,
                brand,
                model,
                new BigDecimal("999.99"),
                category
        );
    }
}