package org.isaac.techinventoryservice.infrastructure.persistence.mapper;

import org.isaac.techinventoryservice.domain.model.Category;
import org.isaac.techinventoryservice.infrastructure.persistence.entity.CategoryEntity;
import org.springframework.stereotype.Component;

@Component
public class CategoryPersistenceMapper {

    public Category toDomain(CategoryEntity entity) {
        if (entity == null) {
            return null;
        }
        return new Category(entity.getId(), entity.getName(), entity.getPrefixCode());
    }

    public CategoryEntity toEntity(Category category) {
        return new CategoryEntity(category.getId(), category.getName(), category.getPrefixCode());
    }
}
