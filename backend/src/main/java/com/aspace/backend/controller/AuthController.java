package com.aspace.backend.controller;

import com.aspace.backend.dto.UserRegistrationDTO;
import com.aspace.backend.entities.User;
import com.aspace.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody UserRegistrationDTO registrationDTO) {
        User registeredUser = authService.registerUser(registrationDTO);

        // Rispondiamo confermando il successo
        return new ResponseEntity<>(Map.of(
                "message", "Utente registrato con successo in A-SPACE!",
                "userId", registeredUser.getId(),
                "username", registeredUser.getUsername()
        ), HttpStatus.CREATED);
    }
}