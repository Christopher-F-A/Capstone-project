package com.aspace.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventCreationDTO {
    private Long associationId;
    private String title;
    private String description;
    private String location;
    private LocalDateTime eventDate;
    private int maxSlots;
}