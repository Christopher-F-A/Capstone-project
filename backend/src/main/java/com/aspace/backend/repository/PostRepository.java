package com.aspace.backend.repository;

import com.aspace.backend.entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Ordina per ID decrescente: l'ultimo post inserito sarà il primo della lista
    List<Post> findByAssociationIdOrderByIdDesc(Long associationId);
}