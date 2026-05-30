package com.aspace.backend.dto;

import lombok.Data;

@Data
public class TransactionStatusUpdateDTO {
    private Long transactionId;
    private String status; // PAID, FAILED, PENDING
    private String invoiceUrl; // Opzionale, generata dopo il pagamento
}