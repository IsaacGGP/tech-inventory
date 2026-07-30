package org.isaac.techinventoryservice.application.port.output;

import org.isaac.techinventoryservice.domain.model.Asset;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssetRepositoryPort {

    Asset save(Asset asset);

    Optional<Asset> findById(UUID technicalId);

    List<Asset> findAll();

    boolean existsById(UUID technicalId);
}
