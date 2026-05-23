package com.aspace.backend.repository;

import com.aspace.backend.entities.Association;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AssociationRepository extends JpaRepository<Association, Long> {
    Optional<Association> findByTaxCodeEts(String taxCodeEts);
    boolean existsByTaxCodeEts(String taxCodeEts);
}
