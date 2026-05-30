package com.aspace.backend.service;

import com.aspace.backend.dto.SavePostDTO;
import com.aspace.backend.entities.Post;
import com.aspace.backend.entities.SavedPost;
import com.aspace.backend.entities.User;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import com.aspace.backend.repository.PostRepository;
import com.aspace.backend.repository.SavedPostRepository;
import com.aspace.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SavedPostService {

    @Autowired
    private SavedPostRepository savedPostRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Salva un post nei preferiti dell'utente.
     */
    @Transactional
    public SavedPost savePost(SavePostDTO dto) {
        // Controllo anti-duplicato
        if (savedPostRepository.existsByPostIdAndUserId(dto.getPostId(), dto.getUserId())) {
            throw new ResourceBadRequestException("Hai già salvato questo post nei tuoi preferiti.");
        }

        Post post = postRepository.findById(dto.getPostId())
                .orElseThrow(() -> new ResourceBadRequestException("Post non trovato."));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceBadRequestException("Utente non trovato."));

        SavedPost savedPost = new SavedPost();
        savedPost.setPost(post);
        savedPost.setUser(user);

        return savedPostRepository.save(savedPost);
    }

    /**
     * Rimuove un post dai preferiti dell'utente.
     */
    @Transactional
    public void unsavePost(SavePostDTO dto) {
        SavedPost savedPost = savedPostRepository.findByPostIdAndUserId(dto.getPostId(), dto.getUserId())
                .orElseThrow(() -> new ResourceBadRequestException("Questo post ho non era presente nei tuoi preferiti."));

        savedPostRepository.delete(savedPost);
    }

    /**
     * Recupera l'elenco di tutti i post salvati da un determinato utente.
     */
    public List<SavedPost> getSavedPostsByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceBadRequestException("Utente non trovato.");
        }
        return savedPostRepository.findByUserIdOrderByIdDesc(userId);
    }
}