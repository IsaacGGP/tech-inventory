package org.isaac.techinventoryservice.infrastructure.web.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateAssetRequest(
        @NotBlank String serialNumber,
        @NotBlank @Size(max = 100) String brand,
        @NotBlank @Size(max = 100) String model,
        @NotNull @DecimalMin(value = "0.01", message = "Acquisition cost must be greater than zero") BigDecimal acquisitionCost,
        @NotNull Long categoryId
) {
}
