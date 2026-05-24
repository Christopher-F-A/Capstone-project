package com.aspace.backend.exceptions;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ResourceBadRequestException extends RuntimeException {
    public static final long serialVersionUID = 1L;

    public ResourceBadRequestException(String message) {
        super(message);
    }
}