package com.aspace.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "minutes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Minute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "association_id", nullable = false)
    private Association association;

    @Column(nullable = false)
    private String title;

    @Column(name = "pdf_url", nullable = false)
    private String pdfUrl;

    @Column(name = "document_hash", nullable = false)
    private String documentHash; // Hash SHA-256 anti-contraffazione del verbale

    @OneToMany(mappedBy = "minute", cascade = CascadeType.ALL)
    private List<Signature> signatures;
}