package com.aspace.backend.controller;

import com.aspace.backend.dto.*;
import com.aspace.backend.entities.Association;
import com.aspace.backend.entities.Membership;
import com.aspace.backend.service.AssociationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    @PutMapping("/membership-decision")
    public ResponseEntity<Map<String, Object>> processDecision(@RequestBody MembershipDecisionDTO dto) {
        Membership updatedMembership = associationService.processMembershipDecision(dto);

        return ResponseEntity.ok(Map.of(
                "message", "Richiesta elaborata con successo!",
                "membershipId", updatedMembership.getId(),
                "newStatus", updatedMembership.getStatus().name(),
                "isBadgeVisible", updatedMembership.isBadgeVisible()
        ));
    }
}