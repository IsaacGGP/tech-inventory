package org.isaac.techinventoryservice.domain.model;

import org.isaac.techinventoryservice.domain.exception.DomainException;

import java.util.Objects;

public class Category {

    private final Long id;
    private final String name;
    private final String prefixCode;

    public Category(String name, String prefixCode) {
        //En null colocar id
        this(null, name, prefixCode);
    }

    public Category(Long id, String name, String prefixCode) {
        this.id = id;
        this.name = validateName(name);
        this.prefixCode = validatePrefixCode(prefixCode);
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPrefixCode() {
        return prefixCode;
    }

    private String validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new DomainException("Category name must not be null or blank");
        }
        return name.trim();
    }

    private String validatePrefixCode(String prefixCode) {
        if (prefixCode == null || prefixCode.isBlank()) {
            throw new DomainException(
                    "Prefix code must not be null or blank"
            );
        }

        String normalized = prefixCode.trim().toUpperCase();

        if (normalized.length() != 3) { //Nota: Se podria validar para que solo ocupe letras y no numeros ej: 12A
            throw new DomainException("Prefix code must be exactly 3 characters");
        }
        return normalized;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Category category)) return false;
        return Objects.equals(id, category.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Category{id=" + id + ", name='" + name + "', prefixCode='" + prefixCode + "'}";
    }
}
