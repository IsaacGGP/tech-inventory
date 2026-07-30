package org.isaac.techinventoryservice.infrastructure.web.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
        @NotBlank String name,
        @NotBlank @Size(min = 3, max = 3) String prefixCode
) {
}
