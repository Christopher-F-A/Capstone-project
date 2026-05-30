package com.aspace.backend.service;

import com.aspace.backend.dto.TransactionCreationDTO;
import com.aspace.backend.dto.TransactionStatusUpdateDTO;
import com.aspace.backend.entities.Membership;
import com.aspace.backend.entities.Transaction;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import com.aspace.backend.repository.MembershipRepository;
import com.aspace.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    /**
     * Inizializza una nuova transazione (es: richiesta di pagamento quota).
     */
    @Transactional
    public Transaction createTransaction(TransactionCreationDTO dto) {
        Membership membership = membershipRepository.findById(dto.getMembershipId())
                .orElseThrow(() -> new ResourceBadRequestException("Membership non trovata."));

        if (dto.getAmount() <= 0) {
            throw new ResourceBadRequestException("L'importo deve essere maggiore di zero.");
        }

        Transaction transaction = new Transaction();
        transaction.setMembership(membership);
        transaction.setAmount(dto.getAmount());
        transaction.setStripeSessionId(dto.getStripeSessionId());
        transaction.setStatus(Transaction.TransactionStatus.PENDING); // Di base parte come PENDING

        try {
            transaction.setType(Transaction.TransactionType.valueOf(dto.getType().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new ResourceBadRequestException("Tipo transazione non valido. Usa 'QUOTA', 'DONAZIONE' o 'MERCH'.");
        }

        return transactionRepository.save(transaction);
    }

    /**
     * Aggiorna lo stato di una transazione (es: da PENDING a PAID tramite Webhook Stripe).
     */
    @Transactional
    public Transaction updateTransactionStatus(TransactionStatusUpdateDTO dto) {
        Transaction transaction = transactionRepository.findById(dto.getTransactionId())
                .orElseThrow(() -> new ResourceBadRequestException("Transazione non trovata."));

        try {
            transaction.setStatus(Transaction.TransactionStatus.valueOf(dto.getStatus().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new ResourceBadRequestException("Stato transazione non valido. Usa 'PAID', 'FAILED' o 'PENDING'.");
        }

        if (dto.getInvoiceUrl() != null) {
            transaction.setInvoiceUrl(dto.getInvoiceUrl());
        }

        return transactionRepository.save(transaction);
    }

    /**
     * Recupera lo storico delle transazioni di una specifica associazione.
     */
    public List<Transaction> getTransactionsByAssociation(Long associationId) {
        return transactionRepository.findByMembershipAssociationIdOrderByIdDesc(associationId);
    }

    /**
     * Recupera lo storico delle transazioni di un singolo tesserato.
     */
    public List<Transaction> getTransactionsByMembership(Long membershipId) {
        return transactionRepository.findByMembershipIdOrderByIdDesc(membershipId);
    }
}