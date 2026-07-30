package org.isaac.techinventoryservice.infrastructure.web.controller;

import jakarta.validation.Valid;
import org.isaac.techinventoryservice.application.port.input.AssetUseCase;
import org.isaac.techinventoryservice.infrastructure.web.dto.request.CreateAssetRequest;
import org.isaac.techinventoryservice.infrastructure.web.dto.request.UpdateAssetRequest;
import org.isaac.techinventoryservice.infrastructure.web.dto.request.UpdateAssetStatusRequest;
import org.isaac.techinventoryservice.infrastructure.web.dto.response.AssetResponse;
import org.isaac.techinventoryservice.infrastructure.web.dto.response.ReportResponse;
import org.isaac.techinventoryservice.infrastructure.web.mapper.AssetWebMapper;
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
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<List<AssetResponse>> getAllAssets() {
        var assets = assetUseCase.getAllAssets().stream().map(assetWebMapper::toResponse).toList();
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/report")
    public ResponseEntity<ReportResponse> generateReport(Authentication authentication) {
        String username = authentication.getName();
        String base64Content = assetUseCase.generateAssetReport(username);
        ReportResponse response = new ReportResponse(
                "assets.zip",
                "application/zip",
                base64Content
        );
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
