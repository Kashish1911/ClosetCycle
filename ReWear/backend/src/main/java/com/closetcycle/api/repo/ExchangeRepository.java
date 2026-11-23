package com.closetcycle.api.repo;
import com.closetcycle.api.model.ExchangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.List;
public interface ExchangeRepository extends JpaRepository<ExchangeRequest, Long> {
    List<ExchangeRequest> findByRequesterIdOrOwnerId(Long requesterId, Long ownerId);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select e from ExchangeRequest e where e.id = :id")
    java.util.Optional<ExchangeRequest> findForUpdate(@Param("id") Long id);
}
