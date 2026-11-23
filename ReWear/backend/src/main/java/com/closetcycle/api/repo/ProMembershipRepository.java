package com.closetcycle.api.repo;

import com.closetcycle.api.model.ProMembership;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.Optional;

public interface ProMembershipRepository extends JpaRepository<ProMembership, Long> {
    Optional<ProMembership> findByUserId(Long userId);
    boolean existsByUserIdAndExpiresAtAfter(Long userId, Instant now);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from ProMembership m where m.user.id = :userId")
    Optional<ProMembership> findForUpdate(@Param("userId") Long userId);
}
