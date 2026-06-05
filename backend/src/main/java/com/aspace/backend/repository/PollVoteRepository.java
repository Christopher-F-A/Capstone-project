package com.aspace.backend.repository;

import com.aspace.backend.entities.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, Long> {

    // Metodo speciale fondamentale utilizzato nel PostService per verificare se un socio ha già espresso il suo voto
    boolean existsByPostIdAndMembershipId(Long postId, Long membershipId);
}