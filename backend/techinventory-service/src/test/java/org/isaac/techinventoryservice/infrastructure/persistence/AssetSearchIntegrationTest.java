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
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class AssetSearchIntegrationTest {

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

        Category laptops = categoryRepository.save(new Category("Laptops", "T1A"));
        Category desktops = categoryRepository.save(new Category("Desktops", "T2B"));

        assetRepository.save(newAsset("IT2-001", "SN-DELL-XPS", "Dell", "XPS 13", laptops));
        assetRepository.save(newAsset("IT2-002", "SN-HP-PAV", "HP", "Pavilion", laptops));
        assetRepository.save(newAsset("IT2-003", "SN-LEN-THK", "Lenovo", "ThinkCentre", desktops));
    }

    @Test
    void searchAssets_withoutTerm_returnsAll() {
        List<Asset> result = assetRepository.findAll(Pageable.unpaged()).getContent();

        assertThat(result).hasSize(3);
    }

    @Test
    void searchAssets_withNull_returnsAll() {
        List<Asset> result = assetUseCase.getAssets(0, 10, null, null, null).getContent();

        assertThat(result).hasSize(3);
    }

    @Test
    void searchAssets_withEmptyString_returnsAll() {
        List<Asset> result = assetUseCase.getAssets(0, 10, criteria(""), null, null).getContent();

        assertThat(result).hasSize(3);
    }

    @Test
    void searchAssets_withBlankSearch_behavesAsListing() {
        List<Asset> result = assetUseCase.getAssets(0, 10, criteria("   "), null, null).getContent();

        assertThat(result).hasSize(3);
    }

    @Test
    void searchAssets_byBrand_caseInsensitive() {
        List<Asset> result = assetRepository.searchAssets(criteria("dell"), Pageable.unpaged()).getContent();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getBrand()).isEqualTo("Dell");
    }

    @Test
    void searchAssets_byModel_partialMatch() {
        List<Asset> result = assetRepository.searchAssets(criteria("think"), Pageable.unpaged()).getContent();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getModel()).isEqualTo("ThinkCentre");
    }

    @Test
    void searchAssets_bySerialNumber_partialMatch() {
        List<Asset> result = assetRepository.searchAssets(criteria("SN-DELL"), Pageable.unpaged()).getContent();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSerialNumber()).isEqualTo("SN-DELL-XPS");
    }

    @Test
    void searchAssets_byInventoryFolio_partialMatch() {
        List<Asset> result = assetRepository.searchAssets(criteria("IT2-002"), Pageable.unpaged()).getContent();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getInventoryFolio()).isEqualTo("IT2-002");
    }

    @Test
    void searchAssets_byCategoryName_caseInsensitive() {
        List<Asset> result = assetRepository.searchAssets(criteria("laptops"), Pageable.unpaged()).getContent();

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(a -> a.getCategory().getName().equalsIgnoreCase("laptops"));
    }

    @Test
    void searchAssets_withNoMatches_returnsEmptyList() {
        List<Asset> result = assetRepository.searchAssets(criteria("nonexistent-term"), Pageable.unpaged()).getContent();

        assertThat(result).isEmpty();
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