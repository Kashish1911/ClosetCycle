package com.closetcycle.api.dto;

import com.closetcycle.api.model.*;
import jakarta.validation.constraints.*;

public final class ApiDtos {
    private ApiDtos() { }
    public record CreateUser(@NotBlank @Size(max = 80) String displayName,
                             @NotBlank @Email @Size(max = 160) String email,
                             @NotBlank @Size(max = 100) String area,
                             @NotBlank @Size(min = 8, max = 72) String password) { }
    public record Login(@NotBlank @Email String email, @NotBlank String password) { }
    public record AuthView(String accessToken, UserView user) { }
    public record UserView(Long id, String displayName, String email, String area, int creditBalance) {
        public static UserView from(UserAccount u) { return new UserView(u.getId(), u.getDisplayName(), u.getEmail(), u.getArea(), u.getCreditBalance()); }
    }
    public record UpdateProfile(@NotBlank @Size(max = 80) String displayName, @NotBlank @Size(max = 100) String area) { }
    public record CreateItem(@NotBlank @Size(max = 120) String title,
                             @Size(max = 1200) String description,
                             @NotBlank String category, @NotBlank String size,
                             @NotBlank String conditionLabel, String color, String brand,
                             @Min(1) @Max(10000) int creditValue, String imageUrl,
                             @NotNull Long ownerId) { }
    public record ItemView(Long id, String title, String description, String category, String size,
                           String condition, String color, String brand, int credits,
                           String imageUrl, ItemStatus status, UserView owner) {
        public static ItemView from(ClothingItem i) { return new ItemView(i.getId(), i.getTitle(), i.getDescription(), i.getCategory(), i.getSize(), i.getConditionLabel(), i.getColor(), i.getBrand(), i.getCreditValue(), i.getImageUrl(), i.getStatus(), UserView.from(i.getOwner())); }
    }
    public record CreateExchange(@NotNull Long requesterId, @NotNull Long requestedItemId,
                                 ExchangeType type, Long offeredItemId) { }
    public record ExchangeView(Long id, Long requesterId, String requesterName, Long ownerId,
                               String ownerName, ItemView requestedItem, ItemView offeredItem,
                               ExchangeType type, ExchangeStatus status, int creditDifference,
                               boolean requesterConfirmed, boolean ownerConfirmed) {
        public static ExchangeView from(ExchangeRequest e) { return new ExchangeView(e.getId(), e.getRequester().getId(), e.getRequester().getDisplayName(), e.getOwner().getId(), e.getOwner().getDisplayName(), ItemView.from(e.getRequestedItem()), e.getOfferedItem() == null ? null : ItemView.from(e.getOfferedItem()), e.getType(), e.getStatus(), e.getCreditDifference(), e.isRequesterConfirmed(), e.isOwnerConfirmed()); }
    }
    public record CreditView(Long id, int amount, String description, Long exchangeId, java.time.Instant createdAt) {
        public static CreditView from(CreditTransaction t) { return new CreditView(t.getId(), t.getAmount(), t.getDescription(), t.getExchangeRequest() == null ? null : t.getExchangeRequest().getId(), t.getCreatedAt()); }
    }
    public record CreateReport(@NotBlank @Size(max = 80) String reason, @Size(max = 1000) String details) { }
    public record ReportView(Long id, Long reporterId, String reporterName, Long itemId, String itemTitle, String reason,
                             String details, String status, java.time.Instant createdAt) {
        public static ReportView from(com.closetcycle.api.model.MemberReport r) {
            return new ReportView(r.getId(), r.getReporter().getId(), r.getReporter().getDisplayName(), r.getItem().getId(), r.getItem().getTitle(), r.getReason(), r.getDetails(), r.getStatus(), r.getCreatedAt());
        }
    }
    public record ProMembershipView(boolean active, ProPlan plan, java.time.Instant expiresAt) { }
    public record CreateProCode(@NotNull ProPlan plan, @Future java.time.Instant expiresAt) { }
    public record ProCodeView(String code, ProPlan plan, java.time.Instant expiresAt) { }
    public record RedeemProCode(@NotBlank @Size(max = 80) String code) { }
    public record CreateProOrder(@NotNull ProPlan plan) { }
    public record ProOrderView(String orderId, String keyId, int amount, String currency, String plan) { }
    public record VerifyProPayment(@NotBlank String orderId, @NotBlank String paymentId, @NotBlank String signature) { }
}
