package com.closetcycle.api.repo;

import com.closetcycle.api.model.ProActivationCode;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ProActivationCodeRepository extends JpaRepository<ProActivationCode, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ProActivationCode c where c.codeHash = :codeHash")
    Optional<ProActivationCode> findForUpdate(@Param("codeHash") String codeHash);
}
