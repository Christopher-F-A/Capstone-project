package com.aspace.backend.repository;

import com.aspace.backend.entities.Signature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SignatureRepository extends JpaRepository<Signature, Long> {
    List<Signature> findByMinuteId(Long minuteId);
    boolean existsByMinuteIdAndMembershipId(Long minuteId, Long membershipId);
}