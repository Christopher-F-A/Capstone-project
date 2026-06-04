package com.aspace.backend.repository;

import com.aspace.backend.entities.SavedPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {

    // Recupera tutti i preferiti di un utente ordinarli per l'ID del salvataggio (più recenti prima)
    List<SavedPost> findByUserIdOrderByIdDesc(Long userId);

    // Verifica se un utente ha già salvato un determinato post
    boolean existsByPostIdAndUserId(Long postId, Long userId);

    // Trova una specifica relazione per poterla eliminare (rimozione preferiti)
    Optional<SavedPost> findByPostIdAndUserId(Long postId, Long userId);

    void deleteByPostId(Long postId);
}