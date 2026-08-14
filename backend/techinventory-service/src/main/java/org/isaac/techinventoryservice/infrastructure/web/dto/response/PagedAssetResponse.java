package org.isaac.techinventoryservice.infrastructure.web.dto.response;

import java.util.List;

public record PagedAssetResponse(
        List<AssetResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}