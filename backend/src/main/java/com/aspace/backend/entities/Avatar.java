package com.aspace.backend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "avatars")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Avatar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    // + campi utili per Three.js (es: livello_goccia, colore_attivo)
}