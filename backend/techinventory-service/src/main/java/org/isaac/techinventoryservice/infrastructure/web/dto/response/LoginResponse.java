package org.isaac.techinventoryservice.infrastructure.web.dto.response;

public record LoginResponse(
        String token,
        String type
) {
}
