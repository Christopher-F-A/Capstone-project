package com.aspace.backend.controller;

import com.aspace.backend.dto.SavePostDTO;
import com.aspace.backend.entities.SavedPost;
import com.aspace.backend.service.SavedPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saved-posts")
public class SavedPostController {

    @Autowired
    private SavedPostService savedPostService;

    /**
     * Aggiunge un post ai preferiti dell'utente.
     * POST http://localhost:8080/api/saved-posts
     */
    @PostMapping
    public ResponseEntity<SavedPost> savePost(@RequestBody SavePostDTO dto) {
        SavedPost saved = savedPostService.savePost(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /**
     * Rimuove un post dai preferiti dell'utente.
     * DELETE http://localhost:8080/api/saved-posts
     */
    @DeleteMapping
    public ResponseEntity<Map<String, String>> unsavePost(@RequestBody SavePostDTO dto) {
        savedPostService.unsavePost(dto);
        return ResponseEntity.ok(Map.of("message", "Post rimosso dai preferiti con successo."));
    }

    /**
     * Ottiene la lista di tutti i post salvati da un utente.
     * GET http://localhost:8080/api/saved-posts/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedPost>> getSavedByUser(@PathVariable Long userId) {
        List<SavedPost> list = savedPostService.getSavedPostsByUser(userId);
        return ResponseEntity.ok(list);
    }
}