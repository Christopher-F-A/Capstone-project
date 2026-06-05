package com.aspace.backend.entities;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

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
    @JsonIgnoreProperties({"user", "association", "memberships", "posts"})
    private Membership author; // Collegato alla membership dell'autore

    @ManyToOne
    @JoinColumn(name = "association_id", nullable = false)
    @JsonIgnoreProperties({"memberships", "posts", "events"})
    private Association association;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostType type;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("post")
    private List<PollOption> pollOptions;

    @Column(nullable = false)
    private String title;

    @Column(name = "content_body", columnDefinition = "TEXT", nullable = false)
    private String contentBody;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "media_url")
    private String mediaUrl;

    @Column(name = "event_id")
    private Long eventId;

    public enum PostType { INFO, EVENT, POLL }
}