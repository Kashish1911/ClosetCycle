package com.closetcycle.api.model;

import jakarta.persistence.*;

@Entity
@Table(name = "exchange_requests")
public class ExchangeRequest extends AuditedEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false) private UserAccount requester;
    @ManyToOne(optional = false) private UserAccount owner;
    @ManyToOne(optional = false) private ClothingItem requestedItem;
    @ManyToOne private ClothingItem offeredItem;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private ExchangeType type;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private ExchangeStatus status = ExchangeStatus.REQUESTED;
    @Column(nullable = false) private int creditDifference;
    @Column(nullable = false) private boolean requesterConfirmed;
    @Column(nullable = false) private boolean ownerConfirmed;

    protected ExchangeRequest() { }
    public ExchangeRequest(UserAccount requester, UserAccount owner, ClothingItem requestedItem,
                           ClothingItem offeredItem, ExchangeType type, int creditDifference) {
        this.requester = requester; this.owner = owner; this.requestedItem = requestedItem;
        this.offeredItem = offeredItem; this.type = type; this.creditDifference = creditDifference;
    }
    public Long getId() { return id; }
    public UserAccount getRequester() { return requester; }
    public UserAccount getOwner() { return owner; }
    public ClothingItem getRequestedItem() { return requestedItem; }
    public ClothingItem getOfferedItem() { return offeredItem; }
    public ExchangeType getType() { return type; }
    public ExchangeStatus getStatus() { return status; }
    public int getCreditDifference() { return creditDifference; }
    public boolean isRequesterConfirmed() { return requesterConfirmed; }
    public boolean isOwnerConfirmed() { return ownerConfirmed; }
    public void setStatus(ExchangeStatus status) { this.status = status; }
    public void confirmFor(Long userId) {
        if (requester.getId().equals(userId)) requesterConfirmed = true;
        if (owner.getId().equals(userId)) ownerConfirmed = true;
    }
}
