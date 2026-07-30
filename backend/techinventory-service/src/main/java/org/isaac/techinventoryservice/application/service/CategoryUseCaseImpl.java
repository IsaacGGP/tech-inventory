package org.isaac.techinventoryservice.application.service;

import org.isaac.techinventoryservice.application.port.input.CategoryUseCase;
import org.isaac.techinventoryservice.application.port.output.CategoryRepositoryPort;
import org.isaac.techinventoryservice.domain.exception.DomainException;
import org.isaac.techinventoryservice.domain.model.Category;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryUseCaseImpl implements CategoryUseCase {

    private final CategoryRepositoryPort repository;

    public CategoryUseCaseImpl(CategoryRepositoryPort repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Category createCategory(String name, String prefixCode) {
        Category category = new Category(name, prefixCode);
        return repository.save(category);
    }

    @Override
    @Transactional(readOnly = true)
    public Category getCategoryById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new DomainException("Category not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return repository.findAll();
    }
}
