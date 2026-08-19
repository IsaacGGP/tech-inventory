package org.isaac.techinventoryservice.infrastructure.web.mapper;

import org.isaac.techinventoryservice.domain.model.Asset;
import org.isaac.techinventoryservice.infrastructure.web.dto.response.AssetResponse;
import org.isaac.techinventoryservice.infrastructure.web.dto.response.ReportPreviewAssetResponse;
import org.springframework.stereotype.Component;

@Component
public class AssetWebMapper {

    private final CategoryWebMapper categoryMapper;

    public AssetWebMapper(CategoryWebMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public AssetResponse toResponse(Asset asset) {
        return new AssetResponse(
                asset.getTechnicalId(),
                asset.getInventoryFolio(),
                asset.getSerialNumber(),
                asset.getBrand(),
                asset.getModel(),
                asset.getStatus(),
                asset.getAcquisitionCost(),
                asset.getEntryDate(),
                categoryMapper.toResponse(asset.getCategory())
        );
    }

    public ReportPreviewAssetResponse toPreviewResponse(Asset asset) {
        return new ReportPreviewAssetResponse(
                asset.getInventoryFolio(),
                asset.getSerialNumber(),
                asset.getBrand(),
                asset.getModel(),
                asset.getStatus(),
                asset.getAcquisitionCost(),
                asset.getEntryDate(),
                asset.getCategory().getName()
        );
    }
}
