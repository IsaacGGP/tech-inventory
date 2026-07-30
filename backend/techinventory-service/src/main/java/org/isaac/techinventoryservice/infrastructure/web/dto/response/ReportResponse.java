package org.isaac.techinventoryservice.infrastructure.web.dto.response;

public record ReportResponse(
        String fileName,
        String contentType,
        String content
) {
}
