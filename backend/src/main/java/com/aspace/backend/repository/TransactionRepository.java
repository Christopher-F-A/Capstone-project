package com.aspace.backend.repository;

import com.aspace.backend.entities.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByMembershipUserId(Long userId);
    Optional<Transaction> findByStripeSessionId(String stripeSessionId);

    // Trova tutte le transazioni di un'associazione passando per la membership
    List<Transaction> findByMembershipAssociationIdOrderByIdDesc(Long associationId);

    // Trova tutte le transazioni di uno specifico tesserato
    List<Transaction> findByMembershipIdOrderByIdDesc(Long membershipId);
}