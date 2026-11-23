package com.closetcycle.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "credit_transactions")
public class CreditTransaction extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) private UserAccount user;
    @ManyToOne private ExchangeRequest exchangeRequest;
    @Column(nullable = false) private int amount;
    @Column(nullable = false, length = 180) private String description;
    protected CreditTransaction() { }
    public CreditTransaction(UserAccount user, ExchangeRequest exchangeRequest, int amount, String description) {
        this.user = user; this.exchangeRequest = exchangeRequest; this.amount = amount; this.description = description;
    }
    public Long getId() { return id; }
    public UserAccount getUser() { return user; }
    public ExchangeRequest getExchangeRequest() { return exchangeRequest; }
    public int getAmount() { return amount; }
    public String getDescription() { return description; }
    public java.time.Instant getCreatedAt() { return super.getCreatedAt(); }
}
