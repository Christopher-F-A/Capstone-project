package com.aspace.backend.dto;

import lombok.Data;

@Data
public class SignMinuteDTO {
    private Long minuteId;
    private Long membershipId;
    private String ipAddress;
}