package org.isaac.techinventoryservice.application.service;

import org.isaac.techinventoryservice.application.port.input.AssetUseCase;
import org.isaac.techinventoryservice.application.port.output.AssetRepositoryPort;
import org.isaac.techinventoryservice.application.port.output.CategoryRepositoryPort;
import org.isaac.techinventoryservice.application.port.output.InventoryFolioGeneratorPort;
import org.isaac.techinventoryservice.application.port.output.ReportGeneratorPort;
import org.isaac.techinventoryservice.domain.enums.AssetStatus;
import org.isaac.techinventoryservice.domain.exception.DomainException;
import org.isaac.techinventoryservice.domain.model.Asset;
import org.isaac.techinventoryservice.domain.model.Category;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class AssetUseCaseImpl implements AssetUseCase {

    private final AssetRepositoryPort assetRepository;
    private final CategoryRepositoryPort categoryRepository;
    private final InventoryFolioGeneratorPort folioGenerator;
    private final ReportGeneratorPort reportGenerator;

    public AssetUseCaseImpl(AssetRepositoryPort assetRepository,
                            CategoryRepositoryPort categoryRepository,
                            InventoryFolioGeneratorPort folioGenerator,
                            ReportGeneratorPort reportGenerator) {
        this.assetRepository = assetRepository;
        this.categoryRepository = categoryRepository;
        this.folioGenerator = folioGenerator;
        this.reportGenerator = reportGenerator;
    }

    private Category getExistingCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new DomainException("Category not found with id: " + categoryId));
    }

    private Asset getExistingAsset(UUID technicalId) {
        return assetRepository.findById(technicalId)
                .orElseThrow(() ->
                        new DomainException("Asset not found with id: " + technicalId));
    }

    @Override
    public Asset createAsset(String serialNumber, String brand, String model,
                             BigDecimal acquisitionCost, Long categoryId) {
       Category category = getExistingCategory(categoryId);

        String inventoryFolio = folioGenerator.generate(category);

        Asset asset = new Asset(
                inventoryFolio,
                serialNumber,
                brand,
                model,
                acquisitionCost,
                category
        );

        return assetRepository.save(asset);
    }

    @Override
    public Asset updateAsset(UUID technicalId, String serialNumber, String brand,
                             String model, BigDecimal acquisitionCost, Long categoryId) {

        Asset existing = getExistingAsset(technicalId);
        Category category = getExistingCategory(categoryId);

        Asset updated = new Asset(
                existing.getTechnicalId(),
                existing.getInventoryFolio(),
                serialNumber,
                brand,
                model,
                existing.getStatus(),
                acquisitionCost,
                existing.getEntryDate(),
                category
        );

        return assetRepository.save(updated);
    }

    @Override
    public Asset updateStatus(UUID technicalId, AssetStatus status) {
        Asset existing = getExistingAsset(technicalId);

        if (existing.getStatus() == AssetStatus.RETIRED) {
            throw new DomainException("Cannot modify status of a RETIRED asset");
        }

        Asset updated = new Asset(
                existing.getTechnicalId(),
                existing.getInventoryFolio(),
                existing.getSerialNumber(),
                existing.getBrand(),
                existing.getModel(),
                status,
                existing.getAcquisitionCost(),
                existing.getEntryDate(),
                existing.getCategory()
        );

        return assetRepository.save(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Asset> getAssetById(UUID technicalId) {
        return assetRepository.findById(technicalId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public String generateAssetReport(String username) {
        List<Asset> assets = assetRepository.findAll();
        return reportGenerator.generateAssetReport(assets, username);
    }
}