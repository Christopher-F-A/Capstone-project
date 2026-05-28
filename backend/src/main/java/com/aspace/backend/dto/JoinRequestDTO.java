package com.aspace.backend.dto;

import lombok.Data;

@Data
public class JoinRequestDTO {
    private Long userId;
    private Long associationId;
}