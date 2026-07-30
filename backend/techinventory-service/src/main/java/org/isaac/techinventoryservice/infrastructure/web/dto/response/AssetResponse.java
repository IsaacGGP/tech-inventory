package org.isaac.techinventoryservice.infrastructure.web.dto.response;

import org.isaac.techinventoryservice.domain.enums.AssetStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AssetResponse(
        UUID technicalId,
        String inventoryFolio,
        String serialNumber,
        String brand,
        String model,
        AssetStatus status,
        BigDecimal acquisitionCost,
        LocalDateTime entryDate,
        CategoryResponse category
) {
}
