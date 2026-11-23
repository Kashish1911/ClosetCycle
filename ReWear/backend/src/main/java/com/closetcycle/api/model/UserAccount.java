package com.closetcycle.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "user_accounts", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class UserAccount extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank @Column(nullable = false, length = 80)
    private String displayName;
    @Email @NotBlank @Column(nullable = false, length = 160)
    private String email;
    @NotBlank @Column(nullable = false, length = 100)
    private String area;
    @Column(nullable = false)
    private int creditBalance = 200;
    @Column(nullable = false, length = 100)
    private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private UserRole role = UserRole.MEMBER;

    protected UserAccount() { }
    public UserAccount(String displayName, String email, String area) {
        this.displayName = displayName; this.email = email.toLowerCase().trim(); this.area = area; this.creditBalance = 200; this.passwordHash = "!";
    }
    public Long getId() { return id; }
    public String getDisplayName() { return displayName; }
    public String getEmail() { return email; }
    public String getArea() { return area; }
    public int getCreditBalance() { return creditBalance; }
    public String getPasswordHash() { return passwordHash; }
    public UserRole getRole() { return role; }
    public void setPasswordHash(String v) { passwordHash = v; }
    public void setRole(UserRole v) { role = v; }
    public void setDisplayName(String v) { displayName = v; }
    public void setArea(String v) { area = v; }
    public void addCredits(int amount) { creditBalance += amount; }
    public void spendCredits(int amount) { creditBalance -= amount; }
}
