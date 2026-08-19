package org.isaac.techinventoryservice.application.port.input;

import org.isaac.techinventoryservice.application.dto.AssetSearchCriteria;
import org.isaac.techinventoryservice.domain.enums.AssetStatus;
import org.isaac.techinventoryservice.domain.model.Asset;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssetUseCase {

    Asset createAsset(
            String serialNumber,
            String brand,
            String model,
            BigDecimal acquisitionCost,
            Long categoryId
    );

    Asset updateAsset(UUID technicalId, String serialNumber, String brand, String model,
                      BigDecimal acquisitionCost, Long categoryId);

    Asset updateStatus(UUID technicalId, AssetStatus status);

    Optional<Asset> getAssetById(UUID technicalId);

    Page<Asset> getAssets(int page, int size, AssetSearchCriteria criteria, String sortBy, String sortDirection);

    List<Asset> getAssetsForReportPreview();

    String generateAssetReport(String username);
}
