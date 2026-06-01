package com.aspace.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "association_id", nullable = false)
    @JsonIgnoreProperties({"memberships", "posts", "events"})
    private Association association;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String location;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @Column(name = "max_slots", nullable = false)
    private int maxSlots;

    @Column(name = "booked_slots", nullable = false)
    private int bookedSlots = 0; // Parte da 0 e si incrementa a ogni prenotazione confermata

    @Column(name = "is_cancelled", nullable = false)
    private boolean isCancelled = false;
}