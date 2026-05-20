package com.aspace.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private Membership author; // Collegato alla membership dell'autore

    @ManyToOne
    @JoinColumn(name = "association_id", nullable = false)
    private Association association;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostType type;

    @Column(nullable = false)
    private String title;

    @Column(name = "content_body", columnDefinition = "TEXT", nullable = false)
    private String contentBody;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "media_url")
    private String mediaUrl;

    public enum PostType { INFO, EVENT }
}