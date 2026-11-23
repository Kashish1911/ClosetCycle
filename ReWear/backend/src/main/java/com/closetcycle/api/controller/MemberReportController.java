package com.closetcycle.api.controller;

import com.closetcycle.api.dto.ApiDtos.CreateReport;
import com.closetcycle.api.dto.ApiDtos.ReportView;
import com.closetcycle.api.service.MemberReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;
import java.util.List;

@RestController
public class MemberReportController {
    private final MemberReportService service;
    public MemberReportController(MemberReportService service) { this.service = service; }

    @PostMapping("/api/items/{itemId}/reports") @ResponseStatus(HttpStatus.CREATED)
    public ReportView create(@PathVariable @NonNull Long itemId, @Valid @RequestBody CreateReport input, @AuthenticationPrincipal Jwt jwt) {
        long reporterId = Long.parseLong(jwt.getSubject());
        return service.create(reporterId, itemId, input.reason(), input.details());
    }

    @GetMapping("/api/admin/reports")
    public List<ReportView> all() { return service.all(); }

    @PatchMapping("/api/admin/reports/{id}")
    public ReportView updateStatus(@PathVariable @NonNull Long id, @RequestParam String status) {
        return service.updateStatus(id, status.toUpperCase());
    }
}
