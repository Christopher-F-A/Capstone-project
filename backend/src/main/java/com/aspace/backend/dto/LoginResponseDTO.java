package com.aspace.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class LoginResponseDTO {
    private String token;
    private Long id;
    private String username;
    private String email;
    private String firstName;
}