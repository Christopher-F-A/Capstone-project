package com.aspace.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "signatures")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Signature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonIgnoreProperties({"association", "posts", "user.memberships"})
    @JoinColumn(name = "membership_id", nullable = false)
    private Membership membership;

    @ManyToOne
    @JoinColumn(name = "minute_id", nullable = false)
    @JsonIgnoreProperties("signatures")
    private Minute minute;

    @Column(name = "ip_address", nullable = false)
    private String ipAddress;

    @Column(name = "signed_at")
    private LocalDateTime signedAt = LocalDateTime.now();
}