package com.aspace.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.List;
import java.util.Collection;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"memberships", "associations", "handler", "hibernateLazyInitializer", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled"})
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    @JsonProperty("username")
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @JsonIgnore // Impedisce tassativamente alla password di entrare in qualsiasi JSON
    private String password;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "tax_code", unique = true)
    private String taxCode;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "is_real_name_public", nullable = false)
    private boolean isRealNamePublic = false;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Membership> memberships;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore // Escludiamo l'avatar dal loop di conversione dell'associazione
    private Avatar avatar;

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    // Spring Security leggerà l'email come nome utente primario
    @Override
    @JsonIgnore // Impedisce a Jackson di vedere questo metodo come un doppione del campo 'username'
    public String getUsername() {
        return this.email;
    }

    public String getEmail() {
        return this.email;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return true;
    }

}