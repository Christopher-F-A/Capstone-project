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
import java.util.Map;
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

    @Transactional
    public Association createAssociation(AssociationCreationDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceBadRequestException("Utente non trovato nel sistema."));

        Association association = new Association();
        association.setName(dto.getName());
        association.setTaxCodeEts(dto.getTaxCodeEts());
        association.setDescription(dto.getDescription());
        association.setBadgeBaseColor(dto.getBadgeBaseColor());
        association.setCreatorUser(creator);

        Association savedAssociation = associationRepository.save(association);

        Membership membership = new Membership();
        membership.setUser(creator);
        membership.setAssociation(savedAssociation);
        membership.setRole(Membership.Role.SUPERADMIN);
        membership.setStatus(Membership.Status.ACTIVE);

        String uniqueCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        membership.setMembershipCode("ASP-" + uniqueCode);
        membership.setBadgeVisible(true);

        membershipRepository.save(membership);
        return savedAssociation;
    }

    public List<Association> getAllAssociations() {
        return associationRepository.findAll();
    }

    public List<MemberResponseDTO> getAssociationMembers(Long associationId) {
        if (!associationRepository.existsById(associationId)) {
            throw new ResourceBadRequestException("Associazione richiesta non trovata.");
        }

        List<Membership> memberships = membershipRepository.findAll().stream()
                .filter(m -> m.getAssociation().getId().equals(associationId))
                .collect(Collectors.toList());

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

    @Transactional
    public Membership requestToJoin(JoinRequestDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceBadRequestException("Utente non trovato."));

        Association association = associationRepository.findById(dto.getAssociationId())
                .orElseThrow(() -> new ResourceBadRequestException("Associazione non trovata."));

        if (membershipRepository.existsByUserIdAndAssociationId(dto.getUserId(), dto.getAssociationId())) {
            throw new ResourceBadRequestException("Hai già una richiesta in corso o sei già membro di questa associazione.");
        }

        Membership membership = new Membership();
        membership.setUser(user);
        membership.setAssociation(association);
        membership.setRole(Membership.Role.MEMBER);
        membership.setStatus(Membership.Status.PENDING);

        String uniqueCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        membership.setMembershipCode("ASP-" + uniqueCode);
        membership.setBadgeVisible(false);

        return membershipRepository.save(membership);
    }

    private Membership getOrCreateAdminMembership(Long userId, Association association) {
        return membershipRepository.findByUserIdAndAssociationId(userId, association.getId())
                .orElseGet(() -> {
                    boolean isCreator = association.getCreatorUser() != null && association.getCreatorUser().getId().equals(userId);
                    if (isCreator) {
                        Membership missingSuperAdmin = new Membership();
                        missingSuperAdmin.setUser(association.getCreatorUser());
                        missingSuperAdmin.setAssociation(association);
                        missingSuperAdmin.setRole(Membership.Role.SUPERADMIN);
                        missingSuperAdmin.setStatus(Membership.Status.ACTIVE);
                        missingSuperAdmin.setMembershipCode("ASP-FIXED" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
                        missingSuperAdmin.setBadgeVisible(true);
                        return membershipRepository.save(missingSuperAdmin);
                    }
                    throw new ResourceBadRequestException("Operazione negata: Non possiedi i privilegi amministrativi per questo ente.");
                });
    }

    @Transactional
    public Membership processMembershipDecision(MembershipDecisionDTO dto, Long adminUserId) {
        Membership membership = membershipRepository.findById(dto.getMembershipId())
                .orElseThrow(() -> new ResourceBadRequestException("Richiesta non trovata."));

        Membership adminMembership = getOrCreateAdminMembership(adminUserId, membership.getAssociation());

        // BLOCCO: Solo il SUPERADMIN può approvare o rifiutare le domande di iscrizione
        if (adminMembership.getRole() != Membership.Role.SUPERADMIN) {
            throw new ResourceBadRequestException("Operazione negata: Solo un SUPERADMIN può approvare o rifiutare i tesseramenti.");
        }

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

    public List<PublicAssociationDTO> findAllPublicAssociations() {
        return associationRepository.findAll().stream()
                .map(a -> new PublicAssociationDTO(
                        a.getId(),
                        a.getName(),
                        a.getDescription(),
                        a.getBadgeBaseColor()
                ))
                .collect(Collectors.toList());
    }

    private void validateHierarchy(Membership adminMembership, Membership targetMembership) {
        // BLOCCO GERARCHICO ASSOLUTO: Solo il SUPERADMIN può modificare ruoli o stati dei membri
        if (adminMembership.getRole() != Membership.Role.SUPERADMIN) {
            throw new ResourceBadRequestException("Operazione negata: Solo un SUPERADMIN ha la facoltà di variare i ruoli o gli stati dei membri.");
        }
    }

    @Transactional
    public Membership updateMemberStatusOrRole(UpdateMemberDTO dto, Long adminUserId) {
        Membership targetMembership = membershipRepository.findById(dto.getMembershipId())
                .orElseThrow(() -> new ResourceBadRequestException("Membro non trovato."));

        Membership adminMembership = getOrCreateAdminMembership(adminUserId, targetMembership.getAssociation());

        validateHierarchy(adminMembership, targetMembership);

        if (dto.getNewRole() != null) {
            try {
                targetMembership.setRole(Membership.Role.valueOf(dto.getNewRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ResourceBadRequestException("Ruolo non valido.");
            }
        }

        if (dto.getNewStatus() != null) {
            try {
                targetMembership.setStatus(Membership.Status.valueOf(dto.getNewStatus().toUpperCase()));
                if (targetMembership.getStatus() == Membership.Status.BANNED || targetMembership.getStatus() == Membership.Status.REJECTED) {
                    targetMembership.setBadgeVisible(false);
                }
            } catch (IllegalArgumentException e) {
                throw new ResourceBadRequestException("Stato non valido.");
            }
        }

        return membershipRepository.save(targetMembership);
    }

    /**
     * Struttura la risposta ritornando una mappa nidificata:
     * { idAssociazione: { "status": "ACTIVE", "role": "ADMIN" } }
     */
    public Map<Long, Map<String, String>> getMyMembershipStatuses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceBadRequestException("Utente autenticato non trovato."));

        return membershipRepository.findAll().stream()
                .filter(m -> m.getUser().getId().equals(currentUser.getId()))
                .collect(Collectors.toMap(
                        m -> m.getAssociation().getId(),
                        m -> Map.of("status", m.getStatus().name(), "role", m.getRole().name())
                ));
    }
}