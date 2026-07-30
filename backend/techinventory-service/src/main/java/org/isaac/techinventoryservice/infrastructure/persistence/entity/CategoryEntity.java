package org.isaac.techinventoryservice.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
public class CategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "prefix_code", nullable = false, unique = true, length = 3)
    private String prefixCode;

    public CategoryEntity() {
    }

    public CategoryEntity(String name, String prefixCode) {
        this.name = name;
        this.prefixCode = prefixCode;
    }

    public CategoryEntity(Long id, String name, String prefixCode) {
        this.id = id;
        this.name = name;
        this.prefixCode = prefixCode;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPrefixCode() {
        return prefixCode;
    }

    public void setPrefixCode(String prefixCode) {
        this.prefixCode = prefixCode;
    }
}
