package com.aspace.backend.controller;

import com.aspace.backend.dto.MinuteCreationDTO;
import com.aspace.backend.dto.SignMinuteDTO;
import com.aspace.backend.entities.Minute;
import com.aspace.backend.entities.Signature;
import com.aspace.backend.service.MinuteService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/minutes")
public class MinuteController {

    @Autowired
    private MinuteService minuteService;

    /**
     * Pubblica un nuovo verbale.
     * POST http://localhost:8080/api/minutes
     */
    @PostMapping
    public ResponseEntity<Minute> createMinute(@RequestBody MinuteCreationDTO dto) {
        Minute createdMinute = minuteService.createMinute(dto);
        return new ResponseEntity<>(createdMinute, HttpStatus.CREATED);
    }

    /**
     * Firma un verbale esistente.
     * POST http://localhost:8080/api/minutes/sign
     */
    @PostMapping("/sign")
    public ResponseEntity<Map<String, Object>> signMinute(@RequestBody SignMinuteDTO dto, HttpServletRequest request) {
        // Se nel DTO non passano l'IP, lo recuperiamo automaticamente dalla richiesta HTTP
        if (dto.getIpAddress() == null || dto.getIpAddress().isEmpty()) {
            dto.setIpAddress(request.getRemoteAddr());
        }

        Signature signature = minuteService.signMinute(dto);
        return new ResponseEntity<>(Map.of(
                "message", "Verbale firmato elettronicamente con successo!",
                "signatureId", signature.getId(),
                "signedAt", signature.getSignedAt(),
                "ipTracked", signature.getIpAddress()
        ), HttpStatus.CREATED);
    }

    /**
     * Ottiene la lista dei verbali di un'associazione.
     * GET http://localhost:8080/api/minutes/association/{associationId}
     */
    @GetMapping("/association/{associationId}")
    public ResponseEntity<List<Minute>> getMinutes(@PathVariable Long associationId) {
        List<Minute> minutes = minuteService.getMinutesByAssociation(associationId);
        return ResponseEntity.ok(minutes);
    }
}