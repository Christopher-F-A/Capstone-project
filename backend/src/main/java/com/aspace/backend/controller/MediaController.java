package com.aspace.backend.controller;

import com.aspace.backend.service.CloudinaryService;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.MessageDigest;
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
            // 1. Carica il file su Cloudinary (genera l'URL sicuro, valido anche per i PDF)
            String secureUrl = cloudinaryService.uploadFile(file);

            // 2. Calcola automaticamente l'hash SHA-256 dai byte del file
            String fileHash = generateSHA256(file);

            // 3. Restituisce entrambi i dati al frontend
            return ResponseEntity.ok(Map.of(
                    "url", secureUrl,
                    "hash", fileHash
            ));
        } catch (Exception e) {
            throw new ResourceBadRequestException("Errore critico durante l'elaborazione del file: " + e.getMessage());
        }
    }

    /**
     * Funzione di utilità per calcolare l'impronta digitale SHA-256 di un file
     */
    private String generateSHA256(MultipartFile file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] encodedHash = digest.digest(file.getBytes());

        // Converte i byte in una stringa esadecimale leggibile (64 caratteri)
        StringBuilder hexString = new StringBuilder(2 * encodedHash.length);
        for (byte b : encodedHash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}