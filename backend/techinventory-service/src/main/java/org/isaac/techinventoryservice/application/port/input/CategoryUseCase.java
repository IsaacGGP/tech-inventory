package org.isaac.techinventoryservice.application.port.input;

import org.isaac.techinventoryservice.domain.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryUseCase {
    //Opcional
    Category createCategory(String name, String prefixCode);

    Category getCategoryById(Long id);

    List<Category> getAllCategories();
}
