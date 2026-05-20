package com.aspace.backend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "saved_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Salva il post a livello di utente globale
}