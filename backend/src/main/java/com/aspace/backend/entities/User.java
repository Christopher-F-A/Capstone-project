package com.aspace.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "tax_code", unique = true)
    private String taxCode;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "is_real_name_public", nullable = false)
    private boolean isRealNamePublic = false;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Membership> memberships;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Avatar avatar;
}