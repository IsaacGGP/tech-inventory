package org.isaac.techinventoryservice.infrastructure.persistence.repository;

import org.isaac.techinventoryservice.infrastructure.persistence.entity.AssetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AssetJpaRepository extends JpaRepository<AssetEntity, UUID> {

}