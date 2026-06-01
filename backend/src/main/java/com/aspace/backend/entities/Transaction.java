package com.aspace.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "membership_id", nullable = false)
    @JsonIgnoreProperties({"transactions", "user", "association"})
    private Membership membership;

    @Column(name = "stripe_session_id")
    private String stripeSessionId;

    @Column(nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(name = "invoice_url")
    private String invoiceUrl;

    public enum TransactionStatus { PAID, FAILED, PENDING }
    public enum TransactionType { QUOTA, DONAZIONE, MERCH }
}