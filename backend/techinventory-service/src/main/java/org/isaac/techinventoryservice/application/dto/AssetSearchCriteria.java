package org.isaac.techinventoryservice.application.dto;

import org.isaac.techinventoryservice.domain.enums.AssetStatus;

import java.math.BigDecimal;

public record AssetSearchCriteria(
        String search,
        Long categoryId,
        AssetStatus status,
        BigDecimal minCost,
        BigDecimal maxCost
) {

    public String normalizedSearch() {
        return (search == null || search.isBlank()) ? null : search.trim();
    }

    public boolean isEmpty() {
        return normalizedSearch() == null
                && categoryId == null
                && status == null
                && minCost == null
                && maxCost == null;
    }
}