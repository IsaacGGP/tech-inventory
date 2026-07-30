package org.isaac.techinventoryservice.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.isaac.techinventoryservice.domain.enums.AssetStatus;

@Entity
@Table(name = "assets")
public class AssetEntity {

    @Id
    @Column(name = "technical_id", unique = true, nullable = false)
    private UUID technicalId;

    @Column(name = "inventory_folio", nullable = false, unique = true)
    private String inventoryFolio;

    @Column(name = "serial_number", nullable = false, unique = true)
    private String serialNumber;

    @Column(name = "brand", nullable = false)
    private String brand;

    @Column(name = "model", nullable = false)
    private String model;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AssetStatus status;

    @Column(name = "acquisition_cost", nullable = false, precision = 12, scale = 2)
    private BigDecimal acquisitionCost;

    @Column(name = "entry_date", nullable = false)
    private LocalDateTime entryDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryEntity category;

    public AssetEntity() {
    }

    public AssetEntity(UUID technicalId, String inventoryFolio, String serialNumber, String brand, String model,
                       AssetStatus status, BigDecimal acquisitionCost, LocalDateTime entryDate,
                       CategoryEntity category) {
        this.technicalId = technicalId;
        this.inventoryFolio = inventoryFolio;
        this.serialNumber = serialNumber;
        this.brand = brand;
        this.model = model;
        this.status = status;
        this.acquisitionCost = acquisitionCost;
        this.entryDate = entryDate;
        this.category = category;
    }

    public UUID getTechnicalId() {
        return technicalId;
    }

    public void setTechnicalId(UUID technicalId) {
        this.technicalId = technicalId;
    }

    public String getInventoryFolio() {
        return inventoryFolio;
    }

    public void setInventoryFolio(String inventoryFolio) {
        this.inventoryFolio = inventoryFolio;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public AssetStatus getStatus() {
        return status;
    }

    public void setStatus(AssetStatus status) {
        this.status = status;
    }

    public BigDecimal getAcquisitionCost() {
        return acquisitionCost;
    }

    public void setAcquisitionCost(BigDecimal acquisitionCost) {
        this.acquisitionCost = acquisitionCost;
    }

    public LocalDateTime getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDateTime entryDate) {
        this.entryDate = entryDate;
    }

    public CategoryEntity getCategory() {
        return category;
    }

    public void setCategory(CategoryEntity category) {
        this.category = category;
    }
}
