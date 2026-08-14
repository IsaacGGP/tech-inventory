package org.isaac.techinventoryservice.application.service;

import org.isaac.techinventoryservice.application.dto.AssetSearchCriteria;
import org.isaac.techinventoryservice.application.port.output.AssetRepositoryPort;
import org.isaac.techinventoryservice.application.port.output.CategoryRepositoryPort;
import org.isaac.techinventoryservice.application.port.output.InventoryFolioGeneratorPort;
import org.isaac.techinventoryservice.application.port.output.ReportGeneratorPort;
import org.isaac.techinventoryservice.domain.enums.AssetStatus;
import org.isaac.techinventoryservice.domain.exception.DomainException;
import org.isaac.techinventoryservice.domain.model.Asset;
import org.isaac.techinventoryservice.domain.model.Category;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssetUseCaseImplTest {

    @Mock
    private AssetRepositoryPort assetRepository;
    @Mock
    private CategoryRepositoryPort categoryRepository;
    @Mock
    private InventoryFolioGeneratorPort folioGenerator;
    @Mock
    private ReportGeneratorPort reportGenerator;

    private AssetUseCaseImpl assetUseCase;

    @BeforeEach
    void setUp() {
        assetUseCase = new AssetUseCaseImpl(assetRepository, categoryRepository, folioGenerator, reportGenerator);
    }

    @Test
    void getAssets_withNullCriteria_usesPagedListing() {
        when(assetRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(asset()), PageRequest.of(0, 10), 1));

        Page<Asset> result = assetUseCase.getAssets(0, 10, null, null, null);

        assertThat(result.getContent()).hasSize(1);
        assertPageablePassed(assetRepository, 0, 10, "inventoryFolio");
        verify(assetRepository, never()).searchAssets(any(), any(Pageable.class));
    }

    @Test
    void getAssets_withEmptySearchCriteria_usesPagedListing() {
        when(assetRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(asset()), PageRequest.of(0, 10), 1));

        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria(""), null, null);

        assertThat(result.getContent()).hasSize(1);
        assertPageablePassed(assetRepository, 0, 10, "inventoryFolio");
        verify(assetRepository, never()).searchAssets(any(), any(Pageable.class));
    }

    @Test
    void getAssets_withBlankSearchCriteria_usesPagedListing() {
        when(assetRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(asset()), PageRequest.of(0, 10), 1));

        Page<Asset> result = assetUseCase.getAssets(0, 10, criteria("   "), null, null);

        assertThat(result.getContent()).hasSize(1);
        assertPageablePassed(assetRepository, 0, 10, "inventoryFolio");
        verify(assetRepository, never()).searchAssets(any(), any(Pageable.class));
    }

    @Test
    void getAssets_withSearch_delegatesCriteriaAndPageable() {
        when(assetRepository.searchAssets(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(asset()), PageRequest.of(0, 5), 1));

        Page<Asset> result = assetUseCase.getAssets(0, 5, criteria("  Dell  "), null, null);

        assertThat(result.getContent()).hasSize(1);
        ArgumentCaptor<AssetSearchCriteria> criteriaCaptor = ArgumentCaptor.forClass(AssetSearchCriteria.class);
        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(assetRepository).searchAssets(criteriaCaptor.capture(), pageableCaptor.capture());
        assertThat(criteriaCaptor.getValue().normalizedSearch()).isEqualTo("Dell");
        assertThat(pageableCaptor.getValue().getPageNumber()).isEqualTo(0);
        assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(5);
        assertThat(pageableCaptor.getValue().getSort()).isEqualTo(Sort.by("inventoryFolio").ascending());
        verify(assetRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    void getAssets_withSortByAndAscending_usesBrandAscending() {
        when(assetRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(asset()), PageRequest.of(0, 10, Sort.by("brand").ascending()), 1));

        Page<Asset> result = assetUseCase.getAssets(0, 10, null, "brand", "asc");

        assertThat(result.getContent()).hasSize(1);
        assertPageablePassed(assetRepository, 0, 10, "brand");
    }

    @Test
    void getAssets_withSortByAndDescending_usesBrandDescending() {
        when(assetRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(asset()), PageRequest.of(0, 10, Sort.by("brand").descending()), 1));

        Page<Asset> result = assetUseCase.getAssets(0, 10, null, "brand", "desc");

        assertThat(result.getContent()).hasSize(1);
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(assetRepository).findAll(captor.capture());
        assertThat(captor.getValue().getSort()).isEqualTo(Sort.by("brand").descending());
    }

    @Test
    void getAssets_withSortByBlank_usesDefaultSort() {
        when(assetRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(asset()), PageRequest.of(0, 10), 1));

        Page<Asset> result = assetUseCase.getAssets(0, 10, null, "   ", "   ");

        assertThat(result.getContent()).hasSize(1);
        assertPageablePassed(assetRepository, 0, 10, "inventoryFolio");
    }

    @Test
    void getAssets_withSortDirectionCaseInsensitiveAndTrimmed_usesDescending() {
        when(assetRepository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(asset()), PageRequest.of(0, 10, Sort.by("brand").descending()), 1));

        Page<Asset> result = assetUseCase.getAssets(0, 10, null, " brand ", "DESC ");

        assertThat(result.getContent()).hasSize(1);
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(assetRepository).findAll(captor.capture());
        assertThat(captor.getValue().getSort()).isEqualTo(Sort.by("brand").descending());
    }

    @Test
    void getAssets_withInvalidSortBy_throws() {
        assertThatThrownBy(() -> assetUseCase.getAssets(0, 10, null, "invalidField", "asc"))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("Invalid sortBy field");
        verify(assetRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    void getAssets_withInvalidSortDirection_throws() {
        assertThatThrownBy(() -> assetUseCase.getAssets(0, 10, null, "brand", "sideways"))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("Invalid sortDirection");
        verify(assetRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    void getAssets_withNegativeMinCost_throws() {
        assertThatThrownBy(() -> assetUseCase.getAssets(0, 10, criteria(null, new BigDecimal("-1"), null), null, null))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("minCost must not be negative");
        verify(assetRepository, never()).findAll(any(Pageable.class));
    }

    @Test
    void getAssets_withNegativeMaxCost_throws() {
        assertThatThrownBy(() -> assetUseCase.getAssets(0, 10, criteria(null, null, new BigDecimal("-1")), null, null))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("maxCost must not be negative");
    }

    @Test
    void getAssets_withMinCostGreaterThanMaxCost_throws() {
        assertThatThrownBy(() -> assetUseCase.getAssets(0, 10, criteria(null, new BigDecimal("2000"), new BigDecimal("1000")), null, null))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("minCost must not be greater than maxCost");
    }

    private void assertPageablePassed(AssetRepositoryPort repository, int page, int size, String sortProperty) {
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(repository).findAll(captor.capture());
        assertThat(captor.getValue().getPageNumber()).isEqualTo(page);
        assertThat(captor.getValue().getPageSize()).isEqualTo(size);
        assertThat(captor.getValue().getSort()).isEqualTo(Sort.by(sortProperty).ascending());
    }

    private AssetSearchCriteria criteria(String search) {
        return new AssetSearchCriteria(search, null, null, null, null);
    }

    private AssetSearchCriteria criteria(String search, BigDecimal minCost, BigDecimal maxCost) {
        return new AssetSearchCriteria(search, null, null, minCost, maxCost);
    }

    private Asset asset() {
        Category category = new Category("Laptops", "LAP");
        return new Asset(
                UUID.randomUUID(),
                "LAP-000001",
                "SN-001",
                "Dell",
                "XPS 13",
                AssetStatus.AVAILABLE,
                new BigDecimal("1200.00"),
                LocalDateTime.now(),
                category
        );
    }
}