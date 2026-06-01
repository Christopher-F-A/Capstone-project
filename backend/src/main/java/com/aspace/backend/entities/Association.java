package com.aspace.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Entity
@Table(name = "associations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Association {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "tax_code_ets", unique = true, nullable = false)
    private String taxCodeEts;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "badge_base_color")
    private String badgeBaseColor;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // AGGIUNTA LA RELAZIONE CON L'UTENTE CREATORE
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creator_user_id", nullable = true) // nullable true per non spaccare i vecchi test se presenti
    @JsonProperty("creatorUser") // Forza il nome del campo nel JSON di risposta
    @JsonIgnoreProperties({"memberships", "associations", "password", "handler", "hibernateLazyInitializer"})
    private User creatorUser;
}