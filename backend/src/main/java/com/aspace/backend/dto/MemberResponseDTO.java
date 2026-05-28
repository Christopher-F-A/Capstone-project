package com.aspace.backend.dto;

import com.aspace.backend.entities.Membership;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MemberResponseDTO {
    private Long membershipId;
    private String membershipCode;
    private String role;
    private String status;
    private Long userId;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
}