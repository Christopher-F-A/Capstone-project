package com.aspace.backend.dto;

import lombok.Data;

@Data
public class UpdateMemberDTO {
    private Long membershipId;
    private String newRole;   // Es: "ADMIN", "SECRETARY", "MEMBER"
    private String newStatus; // Es: "ACTIVE", "BANNED"
}