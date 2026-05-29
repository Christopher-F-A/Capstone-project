package com.aspace.backend.controller;

import com.aspace.backend.dto.PostCreationDTO;
import com.aspace.backend.entities.Post;
import com.aspace.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody PostCreationDTO dto) {
        Post createdPost = postService.createPost(dto);
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    @GetMapping("/association/{associationId}")
    public ResponseEntity<List<Post>> getFeed(@PathVariable Long associationId) {
        List<Post> feed = postService.getFeedByAssociation(associationId);
        return ResponseEntity.ok(feed);
    }
}