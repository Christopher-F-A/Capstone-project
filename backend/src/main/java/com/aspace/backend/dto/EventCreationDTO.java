package com.aspace.backend.dto;

import jakarta.persistence.Column;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventCreationDTO {
    private Long associationId;
    private String title;
    private String description;
    private String location;
    @Column(name = "image_url")
    private String imageUrl;
    private LocalDateTime eventDate;
    private int maxSlots;
}