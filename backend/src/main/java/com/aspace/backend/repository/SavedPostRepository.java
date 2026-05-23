package com.aspace.backend.repository;

import com.aspace.backend.entities.SavedPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {
    List<SavedPost> findByUserId(Long userId);
    void deleteByUserIdAndPostId(Long userId, Long postId);
}