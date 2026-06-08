package com.aspace.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PublicAssociationDTO {
    private Long id;
    private String name;
    private String description;
    private String badgeBaseColor;
    private String logoUrl;
    private String bannerUrl;
}