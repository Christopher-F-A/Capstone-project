package com.aspace.backend.repository;

import com.aspace.backend.entities.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    List<Membership> findByUserId(Long userId);
    List<Membership> findByAssociationIdAndStatus(Long associationId, Membership.Status status);
    Optional<Membership> findByMembershipCode(String membershipCode);
    boolean existsByUserIdAndAssociationId(Long userId, Long associationId);
}