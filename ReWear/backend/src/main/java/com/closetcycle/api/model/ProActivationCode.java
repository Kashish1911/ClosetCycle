package com.closetcycle.api.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "pro_activation_codes")
public class ProActivationCode extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "code_hash", nullable = false, unique = true, length = 64)
    private String codeHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private ProPlan plan;
    @Column(name = "expires_at")
    private Instant expiresAt;
    @Column(name = "redeemed_at")
    private Instant redeemedAt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "redeemed_by")
    private UserAccount redeemedBy;

    protected ProActivationCode() { }
    public ProActivationCode(String codeHash, ProPlan plan, Instant expiresAt) {
        this.codeHash = codeHash; this.plan = plan; this.expiresAt = expiresAt;
    }
    public Long getId() { return id; }
    public ProPlan getPlan() { return plan; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isRedeemed() { return redeemedAt != null; }
    public void redeem(UserAccount user, Instant now) { this.redeemedBy = user; this.redeemedAt = now; }
}
