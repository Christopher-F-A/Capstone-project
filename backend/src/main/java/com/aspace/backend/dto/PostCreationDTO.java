package com.aspace.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PostCreationDTO {
    private Long associationId;
    private Long authorMembershipId; // L'ID della membership di chi crea il post
    private String type; // "INFO" o "EVENT"
    private String title;
    private String contentBody;
    private LocalDate eventDate; // Opzionale (solo se type è EVENT)
    private String mediaUrl;     // Opzionale
}