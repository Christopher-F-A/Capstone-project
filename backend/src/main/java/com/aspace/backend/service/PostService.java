package com.aspace.backend.service;

import com.aspace.backend.dto.PostCreationDTO;
import com.aspace.backend.entities.Association;
import com.aspace.backend.entities.Membership;
import com.aspace.backend.entities.Post;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import com.aspace.backend.repository.AssociationRepository;
import com.aspace.backend.repository.MembershipRepository;
import com.aspace.backend.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private AssociationRepository associationRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    /**
     * Crea e pubblica un nuovo post basato sulla tua entità reale.
     */
    @Transactional
    public Post createPost(PostCreationDTO dto) {
        // 1. Validazione Associazione
        Association association = associationRepository.findById(dto.getAssociationId())
                .orElseThrow(() -> new ResourceBadRequestException("Associazione non trovata."));

        // 2. Validazione Autore (Membership)
        Membership author = membershipRepository.findById(dto.getAuthorMembershipId())
                .orElseThrow(() -> new ResourceBadRequestException("Autore (Membership) non trovato."));

        // 3. Sicurezza logica: l'autore deve appartenere a QUESTA associazione ed essere un gestore
        if (!author.getAssociation().getId().equals(dto.getAssociationId())) {
            throw new ResourceBadRequestException("L'autore non appartiene a questa associazione.");
        }

// NUOVO CONTROLLO: Blocca i semplici tesserati (MEMBER o PENDING)
// (Adatta il nome del metodo getRole() e dell'Enum/Stringa in base a come lo hai strutturato in Membership.java)
        if (author.getRole() == null ||
                (!author.getRole().name().equals("SUPERADMIN") && !author.getRole().name().equals("ADMIN"))) {
            throw new ResourceBadRequestException("Solo gli addetti possono pubblicare post!");
        }

        // 4. Mappatura dei campi reali
        Post post = new Post();
        post.setAssociation(association);
        post.setAuthor(author);
        post.setTitle(dto.getTitle());
        post.setContentBody(dto.getContentBody());
        post.setMediaUrl(dto.getMediaUrl());
        post.setEventDate(dto.getEventDate());

        // Gestione corretta dell'Enum PostType
        try {
            post.setType(Post.PostType.valueOf(dto.getType().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new ResourceBadRequestException("Tipo post non valido. Usa 'INFO' o 'EVENT'.");
        }

        return postRepository.save(post);
    }

    /**
     * Recupera tutti i post dell'associazione ordinati dal più recente.
     */
    public List<Post> getFeedByAssociation(Long associationId) {
        if (!associationRepository.existsById(associationId)) {
            throw new ResourceBadRequestException("Associazione non trovata.");
        }
        return postRepository.findByAssociationIdOrderByIdDesc(associationId);
    }
}