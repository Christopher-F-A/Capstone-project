package com.aspace.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Value("${cloudinary.name}")
    private String cloudName;

    @Value("${cloudinary.apikey}")
    private String apiKey;

    @Value("${cloudinary.secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    public String uploadFile(MultipartFile file) throws IOException {
        // Carica il file come risorsa generica/raw per supportare sia immagini che PDF
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
        return uploadResult.get("secure_url").toString();
    }

    public void deleteFile(String secureUrl) throws IOException {
        if (secureUrl == null || secureUrl.isEmpty()) {
            return;
        }

        // Estrae il public_id dall'URL sicuro di Cloudinary
        // Esempio URL: https://res.cloudinary.com/nome_cloud/image/upload/v12345678/cartella/nome_file.jpg
        // Estrae: "nome_file" (o "cartella/nome_file" se usi cartelle)
        String publicId = extractPublicId(secureUrl);

        if (publicId != null && !publicId.isEmpty()) {
            // Invia il comando di distruzione dell'asset
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
    }

    private String extractPublicId(String url) {
        try {
            int lastSlashIndex = url.lastIndexOf('/');
            int lastDotIndex = url.lastIndexOf('.');
            if (lastSlashIndex != -1 && lastDotIndex != -1 && lastDotIndex > lastSlashIndex) {
                return url.substring(lastSlashIndex + 1, lastDotIndex);
            }
        } catch (Exception e) {
            // Ritorna null se l'URL non ha una struttura valida di Cloudinary
            return null;
        }
        return null;
    }
}