package com.closetcycle.api.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "pro_memberships", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
public class ProMembership extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private ProPlan plan;
    @Column(nullable = false, length = 30)
    private String source;
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    protected ProMembership() { }
    public ProMembership(UserAccount user, ProPlan plan, String source, Instant expiresAt) {
        this.user = user; this.plan = plan; this.source = source; this.expiresAt = expiresAt;
    }
    public Long getId() { return id; }
    public UserAccount getUser() { return user; }
    public ProPlan getPlan() { return plan; }
    public String getSource() { return source; }
    public Instant getExpiresAt() { return expiresAt; }
    public void extend(ProPlan plan, String source, Instant expiresAt) {
        this.plan = plan; this.source = source; this.expiresAt = expiresAt;
    }
}
