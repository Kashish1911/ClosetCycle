package com.closetcycle.api.repo;

import com.closetcycle.api.model.MemberReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MemberReportRepository extends JpaRepository<MemberReport, Long> {
    List<MemberReport> findAllByOrderByCreatedAtDesc();
}
