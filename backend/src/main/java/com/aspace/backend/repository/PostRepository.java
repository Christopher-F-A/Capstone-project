package com.aspace.backend.repository;

import com.aspace.backend.entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Per mostrare la bacheca (Homepage) di una specifica associazione ordinata per ID decrescente
    List<Post> findByAssociationIdOrderByIdDesc(Long associationId);
}