package com.aspace.backend.service;

import com.aspace.backend.dto.PostCreationDTO;
import com.aspace.backend.entities.*;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import com.aspace.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;

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

    @Autowired
    private SavedPostRepository savedPostRepository;

    @Autowired
    private PollOptionRepository pollOptionRepository;

    @Autowired
    private PollVoteRepository pollVoteRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

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

        // 5. Validazione e Conversione del Tipo Post (Enum)
        Post.PostType postType;
        try {
            postType = Post.PostType.valueOf(dto.getType().toUpperCase());
        } catch (IllegalArgumentException e) {
            // AGGIORNATO: Incluso 'POLL' nell'elenco dei tipi validi generati dall'eccezione
            throw new ResourceBadRequestException("Tipo post non valido. Usa 'INFO', 'EVENT' o 'POLL'.");
        }

        // 6. Mappatura dei campi e configurazione dell'istanza
        Post post = new Post();
        post.setType(postType); // Imposta direttamente l'Enum validato
        post.setAssociation(association);
        post.setAuthor(author);
        post.setTitle(dto.getTitle());
        post.setContentBody(dto.getContentBody());

        // Se si tratta di un sondaggio, ripuliamo i campi relativi agli eventi o ai media tradizionali
        if (postType == Post.PostType.POLL) {
            post.setMediaUrl(null);
            post.setEventDate(null);
            post.setEventId(null);
        } else {
            post.setMediaUrl(dto.getMediaUrl());
            post.setEventDate(dto.getEventDate());
            post.setEventId(dto.getEventId());
        }

        // 7. Salvataggio preliminare del Post (necessario per generare l'ID chiave primaria)
        Post savedPost = postRepository.save(post);

        // 8. Logica di indicizzazione delle Opzioni del Sondaggio
        if (postType == Post.PostType.POLL) {
            if (dto.getPollOptions() == null || dto.getPollOptions().size() < 2) {
                throw new ResourceBadRequestException("Un sondaggio richiede la compilazione di almeno 2 opzioni di risposta.");
            }

            for (String optionText : dto.getPollOptions()) {
                if (optionText != null && !optionText.trim().isEmpty()) {
                    PollOption option = new PollOption();
                    option.setPost(savedPost); // Collega l'opzione al post appena salvato
                    option.setOptionText(optionText.trim());

                    // Salva l'opzione a database (richiede l'iniezione del relativo repository)
                    pollOptionRepository.save(option);
                }
            }
        }

        return savedPost;
    }

    @Transactional
    public void castVote(Long postId, Long optionId) {
        // 1. Verifica che il sondaggio esista
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceBadRequestException("Sondaggio non trovato."));

        // 2. Verifica che l'opzione selezionata esista
        PollOption option = pollOptionRepository.findById(optionId)
                .orElseThrow(() -> new ResourceBadRequestException("Opzione di voto non valida."));

        // 3. Sicurezza: Recupera l'utente connesso dal JWT
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceBadRequestException("Utente autenticato non trovato."));

        // 4. Trova la membership reale dell'utente per questa associazione
        Membership membership = membershipRepository.findByUserIdAndAssociationId(currentUser.getId(), post.getAssociation().getId())
                .orElseThrow(() -> new ResourceBadRequestException("Operazione negata: Non sei tesserato in questa associazione."));

        if (membership.getStatus() != Membership.Status.ACTIVE) {
            throw new ResourceBadRequestException("Il tuo tesseramento deve essere attivo per poter votare.");
        }

        // 5. ECCCO L'ACCESSO A POLLVOTE-REPOSITORY (Risolve il warning dell'IDE!)
        // Controllo anti-duplicazione crittografico a livello logico
        boolean alreadyVoted = pollVoteRepository.existsByPostIdAndMembershipId(postId, membership.getId());
        if (alreadyVoted) {
            throw new ResourceBadRequestException("Hai già espresso la tua preferenza per questo sondaggio.");
        }

        // 6. Registra il voto associandolo al post, all'opzione e al membro
        PollVote vote = new PollVote();
        vote.setPost(post);
        vote.setPollOption(option);
        vote.setMembership(membership);

        pollVoteRepository.save(vote);
    }

    @Transactional
    public void deletePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceBadRequestException("Post non trovato."));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceBadRequestException("Utente non trovato."));

        Membership membership = membershipRepository.findByUserIdAndAssociationId(currentUser.getId(), post.getAssociation().getId())
                .orElseThrow(() -> new ResourceBadRequestException("Non hai un tesseramento valido per questo ente."));

        if (membership.getRole() != Membership.Role.ADMIN && membership.getRole() != Membership.Role.SUPERADMIN) {
            throw new ResourceBadRequestException("Operazione negata: Non hai i permessi per eliminare questo post.");
        }

        // 1. ELIMINAZIONE FILE SU CLOUDINARY (Se presente un URL nel post)
        if (post.getMediaUrl() != null) {
            try {
                cloudinaryService.deleteFile(post.getMediaUrl());
            } catch (Exception e) {
                // Usiamo un blocco try-catch per evitare che un errore di rete con Cloudinary
                // blocchi l'eliminazione del post sul database locale
                System.err.println("Impossibile eliminare il file da Cloudinary: " + e.getMessage());
            }
        }

        // 2. Rimosso i vincoli delle tabelle correlate
        savedPostRepository.deleteByPostId(postId);

        // 3. Elimina il post reale
        postRepository.delete(post);
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