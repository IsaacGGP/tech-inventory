package org.isaac.techinventoryservice.infrastructure.persistence.repository;

import org.isaac.techinventoryservice.domain.enums.AssetStatus;
import org.isaac.techinventoryservice.infrastructure.persistence.entity.AssetEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface AssetJpaRepository extends JpaRepository<AssetEntity, UUID> {

    @Query("""
            SELECT a FROM AssetEntity a
            WHERE (:search IS NULL OR LOWER(a.inventoryFolio) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(a.brand) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(a.model) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(a.category.name) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:categoryId IS NULL OR a.category.id = :categoryId)
              AND (:status IS NULL OR a.status = :status)
              AND (:minCost IS NULL OR a.acquisitionCost >= :minCost)
              AND (:maxCost IS NULL OR a.acquisitionCost <= :maxCost)
            """)
    Page<AssetEntity> searchByCriteria(@Param("search") String search,
                                       @Param("categoryId") Long categoryId,
                                       @Param("status") AssetStatus status,
                                       @Param("minCost") BigDecimal minCost,
                                       @Param("maxCost") BigDecimal maxCost,
                                       Pageable pageable);

}