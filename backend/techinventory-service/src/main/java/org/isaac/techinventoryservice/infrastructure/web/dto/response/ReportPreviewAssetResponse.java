package org.isaac.techinventoryservice.infrastructure.web.dto.response;

import org.isaac.techinventoryservice.domain.enums.AssetStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReportPreviewAssetResponse(
        String inventoryFolio,
        String serialNumber,
        String brand,
        String model,
        AssetStatus status,
        BigDecimal acquisitionCost,
        LocalDateTime entryDate,
        String category
) {
}