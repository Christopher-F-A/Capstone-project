package com.aspace.backend.service;

import com.aspace.backend.dto.AssociationCreationDTO;
import com.aspace.backend.dto.JoinRequestDTO;
import com.aspace.backend.entities.Association;
import com.aspace.backend.entities.Membership;
import com.aspace.backend.entities.User;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import com.aspace.backend.repository.AssociationRepository;
import com.aspace.backend.repository.MembershipRepository;
import com.aspace.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.aspace.backend.dto.MemberResponseDTO;
import java.util.List;
import java.util.stream.Collectors;

import java.util.UUID;

@Service
public class AssociationService {

    @Autowired
    private AssociationRepository associationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    /**
     * Crea un'associazione e assegna l'utente creatore come SUPERADMIN attivo.
     */
    @Transactional
    public Association createAssociation(AssociationCreationDTO dto) {
        // 1. Verifica se il codice fiscale ETS è già registrato
        if (associationRepository.existsByTaxCodeEts(dto.getTaxCodeEts())) {
            throw new ResourceBadRequestException("Questo Codice Fiscale ETS è già associato a un'organizzazione su A-SPACE.");
        }

        // 2. Recupera l'utente fondatore
        User creator = userRepository.findById(dto.getCreatorUserId())
                .orElseThrow(() -> new ResourceBadRequestException("Utente creatore non trovato."));

        // 3. Mappa e salva l'Associazione
        Association association = new Association();
        association.setName(dto.getName());
        association.setTaxCodeEts(dto.getTaxCodeEts());
        association.setDescription(dto.getDescription());
        association.setBadgeBaseColor(dto.getBadgeBaseColor());

        Association savedAssociation = associationRepository.save(association);

        // 4. Crea la Membership di tipo SUPERADMIN
        Membership membership = new Membership();
        membership.setUser(creator);
        membership.setAssociation(savedAssociation);
        membership.setRole(Membership.Role.SUPERADMIN);
        membership.setStatus(Membership.Status.ACTIVE);

        // Genera un codice alfanumerico univoco di 8 caratteri per il futuro QR
        String uniqueCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        membership.setMembershipCode("ASP-" + uniqueCode);
        membership.setBadgeVisible(true);

        membershipRepository.save(membership);

        return savedAssociation;
    }

    /**
     * Recupera tutti i membri di una specifica associazione e li mappa nel DTO di risposta.
     */
    public List<MemberResponseDTO> getAssociationMembers(Long associationId) {
        // 1. Controlla se l'associazione esiste davvero
        if (!associationRepository.existsById(associationId)) {
            throw new ResourceBadRequestException("Associazione richiesta non trovata.");
        }

        // 2. Recupera le membership. Usiamo findAll() e filtriamo per ID associazione
        // per prendere tutti gli stati (ACTIVE, PENDING, ecc.)
        List<Membership> memberships = membershipRepository.findAll().stream()
                .filter(m -> m.getAssociation().getId().equals(associationId))
                .collect(Collectors.toList());

        // 3. Mappatura nel DTO pulito per il frontend
        return memberships.stream().map(m -> new MemberResponseDTO(
                m.getId(),
                m.getMembershipCode(),
                m.getRole().name(),
                m.getStatus().name(),
                m.getUser().getId(),
                m.getUser().getUsername(),
                m.getUser().getFirstName(),
                m.getUser().getLastName(),
                m.getUser().getEmail()
        )).collect(Collectors.toList());
    }

    /**
     * Permette a un utente di richiedere l'iscrizione a un'associazione.
     * La membership viene creata come PENDING e ruolo MEMBER.
     */
    @Transactional
    public Membership requestToJoin(JoinRequestDTO dto) {
        // 1. Controlla se l'utente esiste
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceBadRequestException("Utente non trovato."));

        // 2. Controlla se l'associazione esiste
        Association association = associationRepository.findById(dto.getAssociationId())
                .orElseThrow(() -> new ResourceBadRequestException("Associazione non trovata."));

        // 3. Usa il tuo metodo del repository per evitare duplicati!
        if (membershipRepository.existsByUserIdAndAssociationId(dto.getUserId(), dto.getAssociationId())) {
            throw new ResourceBadRequestException("Hai già una richiesta in corso o sei già membro di questa associazione.");
        }

        // 4. Crea la nuova Membership in stato PENDING
        Membership membership = new Membership();
        membership.setUser(user);
        membership.setAssociation(association);
        membership.setRole(Membership.Role.MEMBER); // Ruolo base
        membership.setStatus(Membership.Status.PENDING); // In attesa di approvazione del direttivo

        // Generiamo il codice tessera provvisorio
        String uniqueCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        membership.setMembershipCode("ASP-" + uniqueCode);
        membership.setBadgeVisible(false); // Nascondi il badge finché non è ACTIVE

        return membershipRepository.save(membership);
    }
}
