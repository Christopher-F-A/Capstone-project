package com.aspace.backend.controller;

import com.aspace.backend.dto.*;
import com.aspace.backend.entities.Association;
import com.aspace.backend.entities.Membership;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import com.aspace.backend.repository.UserRepository;
import com.aspace.backend.service.AssociationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.aspace.backend.dto.JoinRequestDTO;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/associations")
public class AssociationController {

    @Autowired
    private AssociationService associationService;

    @PostMapping
    public ResponseEntity<Association> create(@RequestBody AssociationCreationDTO dto) {
        Association created = associationService.createAssociation(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Endpoint per ottenere l'elenco dei soci di una determinata associazione.
     * GET http://localhost:8080/api/associations/{id}/members
     */
    @GetMapping("/{id}/members")
    public ResponseEntity<List<MemberResponseDTO>> getMembers(@PathVariable Long id) {
        List<MemberResponseDTO> members = associationService.getAssociationMembers(id);
        return ResponseEntity.ok(members);
    }

    // 1. NUOVO Endpoint PUBBLICO (da usare per il carosello in Auth.jsx)
    @GetMapping("/public")
    public ResponseEntity<List<PublicAssociationDTO>> getAllPublic() {
        // Qui devi chiamare un metodo del service che converte le Associazioni in DTO
        // Se non lo hai, puoi fare la stream().map(...) direttamente qui
        return ResponseEntity.ok(associationService.findAllPublicAssociations());
    }

    /**
     * Endpoint per ottenere l'elenco completo di tutte le associazioni.
     * GET http://localhost:8080/api/associations
     */
    @GetMapping
    public ResponseEntity<List<Association>> getAllAssociations() {
        // 1. Recuperiamo la lista reale dal Service
        List<Association> list = associationService.getAllAssociations();

        // 2. STAMPA DI DEBUG SULLA CONSOLE DI SPRING BOOT (Guarda il terminale Java!)
        System.out.println("\n========== DEBUG A-SPACE ==========");
        System.out.println("-> Quante associazioni trova Hibernate nel DB? [ " + (list != null ? list.size() : 0) + " ]");
        if (list != null && !list.isEmpty()) {
            System.out.println("-> ID dell'ultimo elemento inserito nel DB: " + list.get(list.size() - 1).getId());
            System.out.println("-> Creatore dell'ultimo elemento: " +
                    (list.get(list.size() - 1).getCreatorUser() != null ? list.get(list.size() - 1).getCreatorUser().getUsername() : "NULL (Nessun Creatore)"));
        }
        System.out.println("===================================\n");

        return ResponseEntity.ok(list);
    }

    /**
     * Endpoint per inviare una richiesta di tesseramento/iscrizione.
     * POST http://localhost:8080/api/associations/join
     */
    @PostMapping("/join")
    public ResponseEntity<Map<String, Object>> joinAssociation(@RequestBody JoinRequestDTO dto) {
        Membership pendingMembership = associationService.requestToJoin(dto);

        return new ResponseEntity<>(Map.of(
                "message", "Richiesta di iscrizione inviata con successo! In attesa di approvazione.",
                "membershipId", pendingMembership.getId(),
                "status", pendingMembership.getStatus().name()
        ), HttpStatus.CREATED);
    }

    /**
     * Endpoint per approvare o rifiutare una richiesta di tesseramento.
     * PUT http://localhost:8080/api/associations/membership-decision
     */
    @Autowired
    private UserRepository userRepository; // Aggiungi questo

    @PutMapping("/membership-decision")
    public ResponseEntity<Map<String, Object>> processDecision(@RequestBody MembershipDecisionDTO dto) {
        // 1. Recupera l'email dal contesto di sicurezza (che è il 'principal')
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Trova l'utente nel DB tramite l'email e prendi l'ID
        Long currentUserId = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceBadRequestException("Utente non trovato nel database."))
                .getId();

        // 3. Ora passa l'ID al service
        Membership updatedMembership = associationService.processMembershipDecision(dto, currentUserId);

        return ResponseEntity.ok(Map.of(
                "message", "Richiesta elaborata con successo!",
                "membershipId", updatedMembership.getId(),
                "newStatus", updatedMembership.getStatus().name()
        ));
    }
}