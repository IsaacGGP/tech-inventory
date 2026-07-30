package org.isaac.techinventoryservice.infrastructure.persistence.repository;

import org.isaac.techinventoryservice.infrastructure.persistence.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryJpaRepository extends JpaRepository<CategoryEntity, Long> {
}
