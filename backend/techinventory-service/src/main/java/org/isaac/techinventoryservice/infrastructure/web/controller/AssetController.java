package org.isaac.techinventoryservice.infrastructure.web.controller;

import jakarta.validation.Valid;
import org.isaac.techinventoryservice.application.dto.AssetSearchCriteria;
import org.isaac.techinventoryservice.application.port.input.AssetUseCase;
import org.isaac.techinventoryservice.domain.enums.AssetStatus;
import org.isaac.techinventoryservice.domain.model.Asset;
import org.isaac.techinventoryservice.infrastructure.web.dto.request.CreateAssetRequest;
import org.isaac.techinventoryservice.infrastructure.web.dto.request.UpdateAssetRequest;
import org.isaac.techinventoryservice.infrastructure.web.dto.request.UpdateAssetStatusRequest;
import org.isaac.techinventoryservice.infrastructure.web.dto.response.AssetResponse;
import org.isaac.techinventoryservice.infrastructure.web.dto.response.PagedAssetResponse;
import org.isaac.techinventoryservice.infrastructure.web.dto.response.ReportPreviewAssetResponse;
import org.isaac.techinventoryservice.infrastructure.web.dto.response.ReportPreviewResponse;
import org.isaac.techinventoryservice.infrastructure.web.dto.response.ReportResponse;
import org.isaac.techinventoryservice.infrastructure.web.mapper.AssetWebMapper;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assets")
public class AssetController {

    private final AssetUseCase assetUseCase;
    private final AssetWebMapper assetWebMapper;

    public AssetController(AssetUseCase assetUseCase, AssetWebMapper assetWebMapper) {
        this.assetUseCase = assetUseCase;
        this.assetWebMapper = assetWebMapper;
    }

    @PostMapping
    public ResponseEntity<AssetResponse> createAsset(@RequestBody @Valid CreateAssetRequest request) {
        var asset = assetUseCase.createAsset(
                request.serialNumber(),
                request.brand(),
                request.model(),
                request.acquisitionCost(),
                request.categoryId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(assetWebMapper.toResponse(asset));
    }

    @GetMapping
    public ResponseEntity<PagedAssetResponse> getAssets(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "status", required = false) AssetStatus status,
            @RequestParam(name = "minCost", required = false) BigDecimal minCost,
            @RequestParam(name = "maxCost", required = false) BigDecimal maxCost,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", required = false) String sortBy,
            @RequestParam(name = "sortDirection", required = false) String sortDirection) {
        AssetSearchCriteria criteria = new AssetSearchCriteria(search, categoryId, status, minCost, maxCost);
        Page<Asset> result = assetUseCase.getAssets(page, size, criteria, sortBy, sortDirection);
        List<AssetResponse> content = result.getContent().stream()
                .map(assetWebMapper::toResponse)
                .toList();
        PagedAssetResponse response = new PagedAssetResponse(
                content,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/report")
    public ResponseEntity<ReportResponse> generateReport(Authentication authentication,
                                                         @RequestParam(name = "search", required = false) String search,
                                                         @RequestParam(name = "categoryId", required = false) Long categoryId,
                                                         @RequestParam(name = "status", required = false) AssetStatus status,
                                                         @RequestParam(name = "minCost", required = false) BigDecimal minCost,
                                                         @RequestParam(name = "maxCost", required = false) BigDecimal maxCost) {
        String username = authentication.getName();
        AssetSearchCriteria criteria = new AssetSearchCriteria(search, categoryId, status, minCost, maxCost);
        String base64Content = assetUseCase.generateAssetReport(username, criteria);
        ReportResponse response = new ReportResponse(
                "assets.zip",
                "application/zip",
                base64Content
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/report/preview")
    public ResponseEntity<ReportPreviewResponse> getReportPreview(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "status", required = false) AssetStatus status,
            @RequestParam(name = "minCost", required = false) BigDecimal minCost,
            @RequestParam(name = "maxCost", required = false) BigDecimal maxCost) {
        AssetSearchCriteria criteria = new AssetSearchCriteria(search, categoryId, status, minCost, maxCost);
        List<ReportPreviewAssetResponse> assets = assetUseCase.getAssetsForReportPreview(criteria).stream()
                .map(assetWebMapper::toPreviewResponse)
                .toList();
        ReportPreviewResponse response = new ReportPreviewResponse(assets, assets.size());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{technicalId}")
    public ResponseEntity<AssetResponse> updateAsset(@PathVariable UUID technicalId,
                                                     @RequestBody @Valid UpdateAssetRequest request) {
        var asset = assetUseCase.updateAsset(
                technicalId,
                request.serialNumber(),
                request.brand(),
                request.model(),
                request.acquisitionCost(),
                request.categoryId()
        );
        return ResponseEntity.ok(assetWebMapper.toResponse(asset));
    }

    @PatchMapping("/{technicalId}/status")
    public ResponseEntity<AssetResponse> updateAssetStatus(@PathVariable UUID technicalId,
                                                           @RequestBody @Valid UpdateAssetStatusRequest request) {
        var asset = assetUseCase.updateStatus(technicalId, request.status());
        return ResponseEntity.ok(assetWebMapper.toResponse(asset));
    }

    @GetMapping("/{technicalId}")
    public ResponseEntity<AssetResponse> getAssetById(@PathVariable UUID technicalId) {
        return assetUseCase.getAssetById(technicalId)
                .map(assetWebMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
