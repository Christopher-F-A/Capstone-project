package com.aspace.backend.repository;

import com.aspace.backend.entities.PollOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PollOptionRepository extends JpaRepository<PollOption, Long> {
    // Eredita automaticamente tutti i metodi CRUD tra cui .save() e .findById()
}