package org.isaac.techinventoryservice.infrastructure.persistence.mapper;

import org.isaac.techinventoryservice.domain.model.Asset;
import org.isaac.techinventoryservice.domain.model.Category;
import org.isaac.techinventoryservice.infrastructure.persistence.entity.AssetEntity;
import org.isaac.techinventoryservice.infrastructure.persistence.entity.CategoryEntity;
import org.springframework.stereotype.Component;

@Component
public class AssetPersistenceMapper {

    private final CategoryPersistenceMapper categoryMapper;

    public AssetPersistenceMapper(CategoryPersistenceMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    public Asset toDomain(AssetEntity entity) {
        if (entity == null) {
            return null;
        }
        Category category = categoryMapper.toDomain(entity.getCategory());
        return new Asset(
                entity.getTechnicalId(),
                entity.getInventoryFolio(),
                entity.getSerialNumber(),
                entity.getBrand(),
                entity.getModel(),
                entity.getStatus(),
                entity.getAcquisitionCost(),
                entity.getEntryDate(),
                category
        );
    }

    public AssetEntity toEntity(Asset domain) {
        if (domain == null) {
            return null;
        }

        CategoryEntity categoryEntity = categoryMapper.toEntity(domain.getCategory());
        return new AssetEntity(
                domain.getTechnicalId(),
                domain.getInventoryFolio(),
                domain.getSerialNumber(),
                domain.getBrand(),
                domain.getModel(),
                domain.getStatus(),
                domain.getAcquisitionCost(),
                domain.getEntryDate(),
                categoryEntity
        );
    }
}
