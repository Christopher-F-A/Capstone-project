package com.aspace.backend.dto;

import lombok.Data;

@Data
public class TransactionCreationDTO {
    private Long membershipId;
    private Long amount; // Importo in centesimi
    private String type; // QUOTA, DONAZIONE, MERCH
    private String stripeSessionId; // se gestito tramite Stripe
}