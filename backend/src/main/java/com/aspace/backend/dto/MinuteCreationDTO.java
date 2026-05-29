package com.aspace.backend.dto;

import lombok.Data;

@Data
public class MinuteCreationDTO {
    private Long associationId;
    private String title;
    private String pdfUrl;
    private String documentHash;
}