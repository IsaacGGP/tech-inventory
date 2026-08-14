package org.isaac.techinventoryservice.infrastructure.persistence.adapter;

import org.isaac.techinventoryservice.application.dto.AssetSearchCriteria;
import org.isaac.techinventoryservice.application.port.output.AssetRepositoryPort;
import org.isaac.techinventoryservice.domain.model.Asset;
import org.isaac.techinventoryservice.infrastructure.persistence.entity.AssetEntity;
import org.isaac.techinventoryservice.infrastructure.persistence.mapper.AssetPersistenceMapper;
import org.isaac.techinventoryservice.infrastructure.persistence.repository.AssetJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class AssetPersistenceAdapter implements AssetRepositoryPort {

    private final AssetJpaRepository jpaRepository;
    private final AssetPersistenceMapper mapper;

    public AssetPersistenceAdapter(AssetJpaRepository jpaRepository, AssetPersistenceMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Asset save(Asset asset) {
        AssetEntity entity = mapper.toEntity(asset);
        AssetEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Asset> findById(UUID technicalId) {
        return jpaRepository.findById(technicalId).map(mapper::toDomain);
    }

    @Override
    public List<Asset> findAll() {
        return jpaRepository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public Page<Asset> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<Asset> searchAssets(AssetSearchCriteria criteria, Pageable pageable) {
        return jpaRepository.searchByCriteria(
                criteria.normalizedSearch(),
                criteria.categoryId(),
                criteria.status(),
                criteria.minCost(),
                criteria.maxCost(),
                pageable
        ).map(mapper::toDomain);
    }

    @Override
    public boolean existsById(UUID technicalId) {
        return jpaRepository.existsById(technicalId);
    }
}
