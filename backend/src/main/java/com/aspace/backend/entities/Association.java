package com.aspace.backend.entities;

import jakarta.persistence.*;
import lombok.*;
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
}