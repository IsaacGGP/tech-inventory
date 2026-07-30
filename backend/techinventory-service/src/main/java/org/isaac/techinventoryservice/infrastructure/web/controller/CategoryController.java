package org.isaac.techinventoryservice.infrastructure.web.controller;

import jakarta.validation.Valid;
import org.isaac.techinventoryservice.application.port.input.CategoryUseCase;
import org.isaac.techinventoryservice.domain.model.Category;
import org.isaac.techinventoryservice.infrastructure.web.dto.request.CreateCategoryRequest;
import org.isaac.techinventoryservice.infrastructure.web.dto.response.CategoryResponse;
import org.isaac.techinventoryservice.infrastructure.web.mapper.CategoryWebMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryUseCase categoryUseCase;
    private final CategoryWebMapper mapper;

    public CategoryController(CategoryUseCase categoryUseCase, CategoryWebMapper mapper) {
        this.categoryUseCase = categoryUseCase;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody @Valid CreateCategoryRequest request) {
        var category = categoryUseCase.createCategory(request.name(), request.prefixCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toResponse(category));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        var categories = categoryUseCase.getAllCategories().stream().map(mapper::toResponse).toList();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        Category category = categoryUseCase.getCategoryById(id);
        return ResponseEntity.ok(mapper.toResponse(category));
    }
}
