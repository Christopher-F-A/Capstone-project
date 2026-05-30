package com.aspace.backend.repository;

import com.aspace.backend.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Recupera la chat speculare tra due utenti ordinata per ID crescente (cronologico)
    List<Message> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByIdAsc(
            Long senderId1, Long receiverId1, Long senderId2, Long receiverId2
    );

    // Ci serve anche questo per i messaggi non letti nel Service
    List<Message> findByReceiverIdAndIsRead(Long receiverId, Message.ReadStatus isRead);
}