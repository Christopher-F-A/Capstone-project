package com.aspace.backend.repository;

import com.aspace.backend.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    // Recupera la chat cronologica tra due utenti specifici
    List<Message> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByIdAsc(
            Long s1, Long r1, Long s2, Long r2
    );
}