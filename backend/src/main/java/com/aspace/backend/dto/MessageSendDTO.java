package com.aspace.backend.dto;

import lombok.Data;

@Data
public class MessageSendDTO {
    private Long senderId;
    private Long receiverId;
    private String content;
}