package com.aspace.backend.repository;

import com.aspace.backend.entities.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    // Recupera tutti gli eventi di una specifica associazione, ordinati dal più recente
    List<Event> findByAssociationIdOrderByEventDateDesc(Long associationId);
}