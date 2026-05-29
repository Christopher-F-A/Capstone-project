package com.aspace.backend.repository;

import com.aspace.backend.entities.Minute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MinuteRepository extends JpaRepository<Minute, Long> {
    List<Minute> findByAssociationId(Long associationId);
    List<Minute> findByAssociationIdOrderByIdDesc(Long associationId);
}