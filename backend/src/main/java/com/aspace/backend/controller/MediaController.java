package com.aspace.backend.controller;

import com.aspace.backend.service.CloudinaryService;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/media")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class MediaController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadMedia(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResourceBadRequestException("Il file selezionato è vuoto o non valido.");
        }
        try {
            String secureUrl = cloudinaryService.uploadFile(file);
            return ResponseEntity.ok(Map.of("url", secureUrl));
        } catch (Exception e) {
            throw new ResourceBadRequestException("Errore critico durante il caricamento su Cloudinary: " + e.getMessage());
        }
    }
}