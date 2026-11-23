package com.closetcycle.api.service;

import com.closetcycle.api.error.InvalidExchangeException;
import com.closetcycle.api.error.ResourceNotFoundException;
import com.closetcycle.api.model.MemberReport;
import com.closetcycle.api.repo.MemberReportRepository;
import com.closetcycle.api.dto.ApiDtos.ReportView;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;

@Service
public class MemberReportService {
    private static final Set<String> STATUSES = Set.of("OPEN", "RESOLVED", "DISMISSED");
    private final MemberReportRepository reports;
    private final UserService users;
    private final ClothingService clothing;

    public MemberReportService(MemberReportRepository reports, UserService users, ClothingService clothing) {
        this.reports = reports; this.users = users; this.clothing = clothing;
    }

    @Transactional public ReportView create(@NonNull Long reporterId, @NonNull Long itemId, String reason, String details) {
        var item = clothing.get(itemId);
        if (item.getOwner().getId().equals(reporterId)) throw new InvalidExchangeException("You cannot report your own listing.");
        String cleanDetails = details == null ? null : details.trim();
        return ReportView.from(reports.save(new MemberReport(users.get(reporterId), item, reason.trim(), cleanDetails)));
    }

    @Transactional(readOnly = true) public List<ReportView> all() { return reports.findAllByOrderByCreatedAtDesc().stream().map(ReportView::from).toList(); }

    @Transactional public ReportView updateStatus(@NonNull Long id, String status) {
        if (!STATUSES.contains(status)) throw new InvalidExchangeException("Report status must be OPEN, RESOLVED, or DISMISSED.");
        var report = reports.findById(id).orElseThrow(() -> new ResourceNotFoundException("Report " + id + " was not found."));
        report.setStatus(status);
        return ReportView.from(report);
    }
}
