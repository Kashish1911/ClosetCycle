package com.closetcycle.api.repo;

import com.closetcycle.api.model.ProPayment;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ProPaymentRepository extends JpaRepository<ProPayment, Long> {
    Optional<ProPayment> findByRazorpayOrderId(String orderId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from ProPayment p where p.razorpayOrderId = :orderId")
    Optional<ProPayment> findForUpdate(@Param("orderId") String orderId);
}
