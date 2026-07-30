package org.isaac.techinventoryservice.infrastructure.web.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateAssetRequest(
        @NotBlank String serialNumber,
        @NotBlank String brand,
        @NotBlank String model,
        @NotNull @DecimalMin(value = "0.01", message = "Acquisition cost must be greater than zero") BigDecimal acquisitionCost,
        @NotNull Long categoryId
) {
}
