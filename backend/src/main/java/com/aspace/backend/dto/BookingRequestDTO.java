package com.aspace.backend.dto;

import lombok.Data;

@Data
public class BookingRequestDTO {
    private Long eventId;
    private Long userId;
}