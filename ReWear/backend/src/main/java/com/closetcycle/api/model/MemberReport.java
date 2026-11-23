package com.closetcycle.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "member_reports")
public class MemberReport extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "reporter_id", nullable = false)
    private UserAccount reporter;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "item_id", nullable = false)
    private ClothingItem item;
    @NotBlank @Column(nullable = false, length = 80)
    private String reason;
    @Column(length = 1000)
    private String details;
    @Column(nullable = false, length = 20)
    private String status = "OPEN";

    protected MemberReport() { }
    public MemberReport(UserAccount reporter, ClothingItem item, String reason, String details) {
        this.reporter = reporter; this.item = item; this.reason = reason; this.details = details; this.status = "OPEN";
    }
    public Long getId() { return id; }
    public UserAccount getReporter() { return reporter; }
    public ClothingItem getItem() { return item; }
    public String getReason() { return reason; }
    public String getDetails() { return details; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
