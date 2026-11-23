package com.closetcycle.api.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "pro_payments")
public class ProPayment extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private ProPlan plan;
    @Column(name = "razorpay_order_id", nullable = false, unique = true, length = 100)
    private String razorpayOrderId;
    @Column(name = "razorpay_payment_id", unique = true, length = 100)
    private String razorpayPaymentId;
    @Column(name = "amount_paise", nullable = false)
    private int amountPaise;
    @Column(nullable = false, length = 20)
    private String status;
    @Column(name = "paid_at")
    private Instant paidAt;

    protected ProPayment() { }
    public ProPayment(UserAccount user, ProPlan plan, String orderId, int amountPaise) {
        this.user = user; this.plan = plan; this.razorpayOrderId = orderId;
        this.amountPaise = amountPaise; this.status = "PENDING";
    }
    public Long getId() { return id; }
    public UserAccount getUser() { return user; }
    public ProPlan getPlan() { return plan; }
    public String getRazorpayOrderId() { return razorpayOrderId; }
    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public int getAmountPaise() { return amountPaise; }
    public String getStatus() { return status; }
    public Instant getPaidAt() { return paidAt; }
    public void markPaid(String paymentId, Instant now) {
        this.razorpayPaymentId = paymentId; this.status = "PAID"; this.paidAt = now;
    }
}
