package com.aspace.backend.dto;

import lombok.Data;

@Data
public class MembershipDecisionDTO {
    private Long membershipId;
    private String action; // "APPROVE", "REJECT"
}