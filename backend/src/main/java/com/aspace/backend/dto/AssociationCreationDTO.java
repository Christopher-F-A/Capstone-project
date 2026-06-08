package com.aspace.backend.dto;

import lombok.Data;

@Data
public class AssociationCreationDTO {
    private String name;
    private String taxCodeEts;
    private String description;
    private String badgeBaseColor;
    private Long creatorUserId; // L'utente che la crea e che diventerà SUPERADMIN
    private String logoUrl;
    private String bannerUrl;
}