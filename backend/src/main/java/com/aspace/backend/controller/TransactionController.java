package com.aspace.backend.controller;

import com.aspace.backend.dto.TransactionCreationDTO;
import com.aspace.backend.dto.TransactionStatusUpdateDTO;
import com.aspace.backend.entities.Transaction;
import com.aspace.backend.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    /**
     * Crea e registra una transazione in stato PENDING.
     * POST http://localhost:8080/api/transactions
     */
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody TransactionCreationDTO dto) {
        Transaction transaction = transactionService.createTransaction(dto);
        return new ResponseEntity<>(transaction, HttpStatus.CREATED);
    }

    /**
     * Aggiorna lo stato di una transazione (Simulazione pagamento riuscito/fallito).
     * PUT http://localhost:8080/api/transactions/status
     */
    @PutMapping("/status")
    public ResponseEntity<Transaction> updateStatus(@RequestBody TransactionStatusUpdateDTO dto) {
        Transaction updatedTransaction = transactionService.updateTransactionStatus(dto);
        return ResponseEntity.ok(updatedTransaction);
    }

    /**
     * Ottiene l'estratto conto di un'intera associazione.
     * GET http://localhost:8080/api/transactions/association/{associationId}
     */
    @GetMapping("/association/{associationId}")
    public ResponseEntity<List<Transaction>> getByAssociation(@PathVariable Long associationId) {
        return ResponseEntity.ok(transactionService.getTransactionsByAssociation(associationId));
    }

    /**
     * Ottiene lo storico pagamenti del singolo tesserato.
     * GET http://localhost:8080/api/transactions/membership/{membershipId}
     */
    @GetMapping("/membership/{membershipId}")
    public ResponseEntity<List<Transaction>> getByMembership(@PathVariable Long membershipId) {
        return ResponseEntity.ok(transactionService.getTransactionsByMembership(membershipId));
    }
}