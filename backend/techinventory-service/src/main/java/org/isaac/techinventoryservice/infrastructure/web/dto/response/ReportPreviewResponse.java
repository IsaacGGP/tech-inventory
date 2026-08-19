package org.isaac.techinventoryservice.infrastructure.web.dto.response;

import java.util.List;

public record ReportPreviewResponse(
        List<ReportPreviewAssetResponse> assets,
        long totalElements
) {
}