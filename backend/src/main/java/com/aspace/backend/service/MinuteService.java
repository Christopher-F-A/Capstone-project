package com.aspace.backend.service;

import com.aspace.backend.dto.MinuteCreationDTO;
import com.aspace.backend.dto.SignMinuteDTO;
import com.aspace.backend.entities.Association;
import com.aspace.backend.entities.Membership;
import com.aspace.backend.entities.Minute;
import com.aspace.backend.entities.Signature;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import com.aspace.backend.repository.AssociationRepository;
import com.aspace.backend.repository.MembershipRepository;
import com.aspace.backend.repository.MinuteRepository;
import com.aspace.backend.repository.SignatureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        minute.setPdfUrl(dto.getPdfUrl());
        minute.setDocumentHash(dto.getDocumentHash());

        return minuteRepository.save(minute);
    }

    /**
     * Appone una firma digitale con tracciamento IP sul verbale.
     */
    @Transactional
    public Signature signMinute(SignMinuteDTO dto) {
        Minute minute = minuteRepository.findById(dto.getMinuteId())
                .orElseThrow(() -> new ResourceBadRequestException("Verbale non trovato."));

        Membership membership = membershipRepository.findById(dto.getMembershipId())
                .orElseThrow(() -> new ResourceBadRequestException("Membership non trovata."));

        // Controllo di sicurezza: la membership appartiene all'associazione del verbale?
        if (!membership.getAssociation().getId().equals(minute.getAssociation().getId())) {
            throw new ResourceBadRequestException("Non puoi firmare un verbale di un'altra associazione.");
        }

        // Controllo anti-duplicato: ha già firmato questo specifico verbale?
        boolean alreadySigned = signatureRepository.existsByMinuteIdAndMembershipId(dto.getMinuteId(), dto.getMembershipId());
        if (alreadySigned) {
            throw new ResourceBadRequestException("Hai già apposto la tua firma su questo verbale.");
        }

        Signature signature = new Signature();
        signature.setMinute(minute);
        signature.setMembership(membership);
        signature.setIpAddress(dto.getIpAddress());
        signature.setSignedAt(LocalDateTime.now());

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
}