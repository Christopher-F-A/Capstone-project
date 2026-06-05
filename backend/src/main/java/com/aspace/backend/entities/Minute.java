package com.aspace.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.time.LocalDateTime;

    @Entity
    @Table(name = "minutes")
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public class Minute {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String title;

        // MODIFICATO: Diventa un campo di testo capiente per memorizzare il testo del verbale scritto in loco
        @Column(nullable = false, columnDefinition = "TEXT")
        private String contentBody;

        @Column(name = "document_hash", nullable = false)
        private String documentHash;

        @Column(name = "created_at", nullable = false)
        private LocalDateTime createdAt = LocalDateTime.now();

        @ManyToOne
        @JoinColumn(name = "association_id", nullable = false)
        @JsonIgnoreProperties({"memberships", "posts", "events", "minutes"})
        private Association association;

        @OneToMany(mappedBy = "minute", cascade = CascadeType.ALL, orphanRemoval = true)
        private List<Signature> signatures;
    }