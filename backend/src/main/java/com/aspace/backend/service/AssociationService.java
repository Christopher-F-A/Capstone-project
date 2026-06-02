package com.aspace.backend.service;

import com.aspace.backend.dto.*;
import com.aspace.backend.entities.Association;
import com.aspace.backend.entities.Membership;
import com.aspace.backend.entities.User;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import com.aspace.backend.repository.AssociationRepository;
import com.aspace.backend.repository.MembershipRepository;
import com.aspace.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        // Recupera l'email dal token JWT autenticato
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // Recupera l'utente dal DB usando l'email
        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceBadRequestException("Utente non trovato nel sistema."));

        // 3. Mappa e salva l'Associazione
        Association association = new Association();
        association.setName(dto.getName());
        association.setTaxCodeEts(dto.getTaxCodeEts());
        association.setDescription(dto.getDescription());
        association.setBadgeBaseColor(dto.getBadgeBaseColor());
        //Colleghiamo il creatore all'entità associazione
        association.setCreatorUser(creator);

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

    public List<Association> getAllAssociations() {
        return associationRepository.findAll();
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

    /**
     * Permette agli amministratori di approvare o rifiutare una richiesta di tesseramento.
     */
    @Transactional
    public Membership processMembershipDecision(MembershipDecisionDTO dto, Long adminUserId) {
        // 1. Recupera la richiesta
        Membership membership = membershipRepository.findById(dto.getMembershipId())
                .orElseThrow(() -> new ResourceBadRequestException("Richiesta non trovata."));

        // 2. Recupera chi sta decidendo
        Membership adminMembership = membershipRepository.findByUserIdAndAssociationId(adminUserId, membership.getAssociation().getId())
                .orElseThrow(() -> new ResourceBadRequestException("Non sei membro di questa associazione."));

        // 3. Controllo gerarchico: l'admin può modificare questo target?
        if (adminMembership.getRole() == Membership.Role.ADMIN && membership.getRole() == Membership.Role.SUPERADMIN) {
            throw new ResourceBadRequestException("Un Admin non può modificare un SuperAdmin!");
        }

        // 4. Esegui l'azione
        String action = dto.getAction().toUpperCase();
        if ("APPROVE".equals(action)) {
            membership.setStatus(Membership.Status.ACTIVE);
            membership.setBadgeVisible(true);
        } else if ("REJECT".equals(action)) {
            membership.setStatus(Membership.Status.REJECTED);
            membership.setBadgeVisible(false);
        }

        return membershipRepository.save(membership);
    }
    /**
     * Recupera le associazioni in formato pubblico (senza dati sensibili).
     * Da usare per il carosello nella pagina di login.
     */
    public List<com.aspace.backend.dto.PublicAssociationDTO> findAllPublicAssociations() {
        return associationRepository.findAll().stream()
                .map(a -> new com.aspace.backend.dto.PublicAssociationDTO(
                        a.getId(),
                        a.getName(),
                        a.getDescription(),
                        a.getBadgeBaseColor()
                ))
                .collect(Collectors.toList());}

    /**
     * Verifica la gerarchia dei permessi prima di un'azione.
     * Restituisce true se l'azione è consentita.
     */
    private void validateHierarchy(Membership adminMembership, Membership targetMembership) {
        // Se l'admin è SUPERADMIN, può fare tutto
        if (adminMembership.getRole() == Membership.Role.SUPERADMIN) {
            return;
        }

        // Se l'admin è ADMIN, non può toccare un altro ADMIN o un SUPERADMIN
        if (adminMembership.getRole() == Membership.Role.ADMIN) {
            if (targetMembership.getRole() == Membership.Role.SUPERADMIN ||
                    targetMembership.getRole() == Membership.Role.ADMIN) {
                throw new ResourceBadRequestException("Operazione negata: Non puoi modificare i privilegi di un altro amministratore.");
            }
        }
    }
    @Transactional
    public Membership updateMemberStatusOrRole(UpdateMemberDTO dto, Long adminUserId) {
        // 1. Recupera la membership del target da modificare
        Membership targetMembership = membershipRepository.findById(dto.getMembershipId())
                .orElseThrow(() -> new ResourceBadRequestException("Membro non trovato."));

        // 2. Recupera la membership di chi sta compiendo l'azione
        Membership adminMembership = membershipRepository.findByUserIdAndAssociationId(adminUserId, targetMembership.getAssociation().getId())
                .orElseThrow(() -> new ResourceBadRequestException("Non hai i permessi per questa associazione."));

        // 3. Valida la gerarchia
        validateHierarchy(adminMembership, targetMembership);

        // 4. Aggiorna il Ruolo se inviato nel DTO
        if (dto.getNewRole() != null) {
            try {
                targetMembership.setRole(Membership.Role.valueOf(dto.getNewRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ResourceBadRequestException("Ruolo non valido.");
            }
        }

        // 5. Aggiorna lo Stato (Es: Modificare in BANNED equivale ad eliminarlo dalle funzioni del portale)
        if (dto.getNewStatus() != null) {
            try {
                targetMembership.setStatus(Membership.Status.valueOf(dto.getNewStatus().toUpperCase()));
                // Se viene bannato o respinto, nascondiamo anche il badge per sicurezza
                if (targetMembership.getStatus() == Membership.Status.BANNED || targetMembership.getStatus() == Membership.Status.REJECTED) {
                    targetMembership.setBadgeVisible(false);
                }
            } catch (IllegalArgumentException e) {
                throw new ResourceBadRequestException("Stato non valido.");
            }
        }

        return membershipRepository.save(targetMembership);
    }}
