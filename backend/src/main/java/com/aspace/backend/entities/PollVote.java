package com.aspace.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "poll_votes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"post_id", "membership_id"}) // Impedisce il voto multiplo a livello DB
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PollVote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    @JsonIgnoreProperties({"pollOptions", "votes"})
    private Post post;

    @ManyToOne
    @JoinColumn(name = "poll_option_id", nullable = false)
    @JsonIgnoreProperties("votes")
    private PollOption pollOption;

    @ManyToOne
    @JoinColumn(name = "membership_id", nullable = false)
    @JsonIgnoreProperties({"association", "posts"})
    private Membership membership;
}
