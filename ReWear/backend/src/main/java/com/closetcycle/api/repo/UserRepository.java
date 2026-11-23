package com.closetcycle.api.repo;
import com.closetcycle.api.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;
public interface UserRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByEmail(String email);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select u from UserAccount u where u.id = :id")
    Optional<UserAccount> findForUpdate(@Param("id") Long id);
}
