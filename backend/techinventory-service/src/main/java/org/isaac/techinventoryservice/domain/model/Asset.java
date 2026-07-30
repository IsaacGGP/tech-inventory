package org.isaac.techinventoryservice.domain.model;

import org.isaac.techinventoryservice.domain.enums.AssetStatus;
import org.isaac.techinventoryservice.domain.exception.DomainException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

public class Asset {

    private final UUID technicalId;
    private final String inventoryFolio;
    private final String serialNumber;
    private final String brand;
    private final String model;
    private final AssetStatus status;
    private final BigDecimal acquisitionCost;
    private final LocalDateTime entryDate;
    private final Category category;

    public Asset(String inventoryFolio, String serialNumber, String brand,
            String model, BigDecimal acquisitionCost, Category category
    ) {
        this(
                UUID.randomUUID(), inventoryFolio, serialNumber, brand, model,
                AssetStatus.AVAILABLE, acquisitionCost, LocalDateTime.now(),
                category
        );
    }

    public Asset(UUID technicalId, String inventoryFolio, String serialNumber, String brand, String model,
                 AssetStatus status, BigDecimal acquisitionCost, LocalDateTime entryDate,
                 Category category) {
        this.technicalId = validateTechnicalId(technicalId);
        this.inventoryFolio = validateRequired(inventoryFolio, "Inventory folio");
        this.serialNumber = validateRequired(serialNumber, "Serial number");
        this.brand = validateRequired(brand, "Brand");
        this.model = validateRequired(model, "Model");
        this.status = validateNonNull(status, "Status");
        this.acquisitionCost = validateCost(acquisitionCost);
        this.entryDate = validateNonNull(entryDate, "Entry date");
        this.category = validateNonNull(category, "Category");
    }

    public UUID getTechnicalId() {
        return technicalId;
    }

    public String getInventoryFolio() {
        return inventoryFolio;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public String getBrand() {
        return brand;
    }
    public String getModel() {
        return model;
    }

    public AssetStatus getStatus() {
        return status;
    }

    public BigDecimal getAcquisitionCost() {
        return acquisitionCost;
    }

    public LocalDateTime getEntryDate() {
        return entryDate;
    }

    public Category getCategory() {
        return category;
    }

    private UUID validateTechnicalId(UUID technicalId) {
        if (technicalId == null) {
            throw new DomainException("Asset ID must not be null");
        }
        return technicalId;
    }

    private String validateRequired(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new DomainException(fieldName + " must not be null or blank");
        }
        return value.trim();
    }

    private <T> T validateNonNull(T value, String fieldName) {
        if (value == null) {
            throw new DomainException(fieldName + " must not be null");
        }
        return value;
    }

    private BigDecimal validateCost(BigDecimal cost) {
        if (cost == null) {
            throw new DomainException("Acquisition cost must not be null");
        }
        if (cost.compareTo(BigDecimal.ZERO) < 0) {
            throw new DomainException("Acquisition cost must not be negative");
        }
        return cost;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Asset asset)) return false;
        return Objects.equals(technicalId, asset.technicalId);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(technicalId);
    }

    @Override
    public String toString() {
        return "Asset{technicalId=" + technicalId + ", folio='" + inventoryFolio + "', serial='" + serialNumber + "'}";
    }
}
