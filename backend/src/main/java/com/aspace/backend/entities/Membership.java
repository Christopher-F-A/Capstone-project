package com.aspace.backend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "memberships")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Membership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "association_id", nullable = false)
    private Association association;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "membership_code", unique = true, nullable = false)
    private String membershipCode;

    @Column(name = "is_badge_visible")
    private boolean isBadgeVisible = true;

    public enum Role { SUPERADMIN, ADMIN, SEGRETERIA, DIRETTIVO, SOCIO }
    public enum Status { PENDING, ACTIVE, BANNED }
}