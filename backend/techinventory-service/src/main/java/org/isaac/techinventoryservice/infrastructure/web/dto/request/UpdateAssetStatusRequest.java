package org.isaac.techinventoryservice.infrastructure.web.dto.request;

import jakarta.validation.constraints.NotNull;
import org.isaac.techinventoryservice.domain.enums.AssetStatus;

public record UpdateAssetStatusRequest(
        @NotNull AssetStatus status
) {
}
