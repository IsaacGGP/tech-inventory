package org.isaac.techinventoryservice.application.port.output;

import org.isaac.techinventoryservice.application.dto.AssetSearchCriteria;
import org.isaac.techinventoryservice.domain.model.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssetRepositoryPort {

    Asset save(Asset asset);

    Optional<Asset> findById(UUID technicalId);

    List<Asset> findAll();

    Page<Asset> findAll(Pageable pageable);

    Page<Asset> searchAssets(AssetSearchCriteria criteria, Pageable pageable);

    boolean existsById(UUID technicalId);
}
