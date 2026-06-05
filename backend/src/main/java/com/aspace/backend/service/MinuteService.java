package com.aspace.backend.service;

import com.aspace.backend.dto.MinuteCreationDTO;
import com.aspace.backend.dto.SignMinuteDTO;
import com.aspace.backend.entities.*;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import com.aspace.backend.repository.AssociationRepository;
import com.aspace.backend.repository.MembershipRepository;
import com.aspace.backend.repository.MinuteRepository;
import com.aspace.backend.repository.SignatureRepository;
import com.aspace.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MinuteService {

    @Autowired
    private MinuteRepository minuteRepository;

    @Autowired
    private AssociationRepository associationRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SignatureRepository signatureRepository;

    /**
     * Carica e registra un nuovo verbale d'assemblea.
     */
    @Transactional
    public Minute createMinute(MinuteCreationDTO dto) {
        Association association = associationRepository.findById(dto.getAssociationId())
                .orElseThrow(() -> new ResourceBadRequestException("Associazione non trovata."));

        Minute minute = new Minute();
        minute.setAssociation(association);
        minute.setTitle(dto.getTitle());
        minute.setContentBody(dto.getContentBody());

        // AUTOMAZIONE: Calcola l'hash SHA-256 combinando Titolo + Contenuto in modo deterministico
        try {
            String rawTextToHash = dto.getTitle() + "||" + dto.getContentBody();
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(rawTextToHash.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder(2 * encodedHash.length);
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            minute.setDocumentHash(hexString.toString()); // L'hash viene inserito in automatico!
        } catch (Exception e) {
            throw new ResourceBadRequestException("Impossibile generare l'impronta crittografica del testo.");
        }

        return minuteRepository.save(minute);
    }

    /**
     * Appone una firma digitale con tracciamento IP sul verbale.
     */
    @Transactional
    public Signature signMinute(SignMinuteDTO dto) { // <-- Cambiato il tipo di ritorno in Signature

        // 1. Recupera il verbale usando l'ID estratto dal DTO
        Minute minute = minuteRepository.findById(dto.getMinuteId())
                .orElseThrow(() -> new ResourceBadRequestException("Verbale non trovato."));

        // 2. Sicurezza: Recupera l'utente connesso dal JWT in modo protetto
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceBadRequestException("Utente non trovato."));

        // 3. Trova la REALE membership dell'utente per l'associazione di QUESTO verbale
        // Questo risolve il bug bloccando lo scambio di ID errati tra front-end e back-end
        Membership membership = membershipRepository.findByUserIdAndAssociationId(currentUser.getId(), minute.getAssociation().getId())
                .orElseThrow(() -> new ResourceBadRequestException("Operazione negata: Non hai un tesseramento valido per questo ente."));

        // 4. Controlla lo stato del tesseramento
        if (membership.getStatus() != Membership.Status.ACTIVE) {
            throw new ResourceBadRequestException("Non puoi firmare un documento se il tuo tesseramento non è attivo.");
        }

        // 5. Crea la firma inserendo i dati reali validati dal server
        Signature signature = new Signature();
        signature.setMinute(minute);
        signature.setMembership(membership); // Associa la membership estratta dal JWT

        // L'IP viene preso dal DTO (che il tuo controller ha già provveduto a calcolare tramite HttpServletRequest)
        signature.setIpAddress(dto.getIpAddress() != null ? dto.getIpAddress() : "0.0.0.0");

        // 6. Salva e RITORNA l'entità creata (così il controller riceve i dati per la risposta JSON)
        return signatureRepository.save(signature);
    }

    /**
     * Elenca tutti i verbali di un'associazione.
     */
    public List<Minute> getMinutesByAssociation(Long associationId) {
        if (!associationRepository.existsById(associationId)) {
            throw new ResourceBadRequestException("Associazione non trovata.");
        }
        return minuteRepository.findByAssociationIdOrderByIdDesc(associationId);
    }

    public String calculateSHA256(byte[] fileBytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(fileBytes);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString(); // Restituisce l'hash alfanumerico unico
        } catch (Exception e) {
            throw new RuntimeException("Errore durante il calcolo dell'hash", e);
        }
    }
}