package org.isaac.techinventoryservice.infrastructure.web.mapper;

import org.isaac.techinventoryservice.domain.model.Category;
import org.isaac.techinventoryservice.infrastructure.web.dto.response.CategoryResponse;
import org.springframework.stereotype.Component;

@Component
public class CategoryWebMapper {
    public CategoryResponse toResponse(Category category){
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getPrefixCode()
        );
    }
}
