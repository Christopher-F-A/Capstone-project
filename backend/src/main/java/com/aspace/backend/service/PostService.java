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
import org.springframework.security.core.context.SecurityContextHolder;
import com.aspace.backend.entities.User;
import com.aspace.backend.repository.UserRepository;

import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private AssociationRepository associationRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Crea e pubblica un nuovo post basato sulla tua entità reale.
     */
    @Transactional
    public Post createPost(PostCreationDTO dto) {
        // 1. Validazione esistenza Associazione
        Association association = associationRepository.findById(dto.getAssociationId())
                .orElseThrow(() -> new ResourceBadRequestException("Associazione non trovata."));

        // 2. Sicurezza: Recupera l'email dell'utente corrente dal token JWT autenticato
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceBadRequestException("Utente autenticato non trovato."));

        // 3. Trova la reale riga di tesseramento (Membership) di questo utente per QUESTA associazione
        Membership author = membershipRepository.findByUserIdAndAssociationId(currentUser.getId(), association.getId())
                .orElseThrow(() -> new ResourceBadRequestException("L'autore non appartiene a questa associazione."));

        // 4. Controllo Autorizzazioni: Blocca i semplici tesserati (MEMBER o PENDING)
        if (author.getRole() == null ||
                (!author.getRole().name().equals("SUPERADMIN") && !author.getRole().name().equals("ADMIN"))) {
            throw new ResourceBadRequestException("Solo gli addetti possono pubblicare post!");
        }

        // 5. Mappatura dei campi e salvataggio
        Post post = new Post();
        post.setAssociation(association);
        post.setAuthor(author); // Usa la membership reale recuperata in modo sicuro dal server
        post.setTitle(dto.getTitle());
        post.setContentBody(dto.getContentBody());
        post.setMediaUrl(dto.getMediaUrl());
        post.setEventDate(dto.getEventDate());

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