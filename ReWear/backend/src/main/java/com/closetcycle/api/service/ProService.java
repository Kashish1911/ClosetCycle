package com.closetcycle.api.service;

import com.closetcycle.api.dto.ApiDtos.*;
import com.closetcycle.api.error.InvalidExchangeException;
import com.closetcycle.api.error.InvalidPaymentException;
import com.closetcycle.api.error.ResourceNotFoundException;
import com.closetcycle.api.model.*;
import com.closetcycle.api.repo.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
public class ProService {
    private static final SecureRandom RANDOM = new SecureRandom();
    private final UserRepository users;
    private final ProMembershipRepository memberships;
    private final ProActivationCodeRepository codes;
    private final ProPaymentRepository payments;
    private final RazorpayGateway razorpay;
    private final ObjectMapper json;

    public ProService(UserRepository users, ProMembershipRepository memberships,
                      ProActivationCodeRepository codes, ProPaymentRepository payments,
                      RazorpayGateway razorpay, ObjectMapper json) {
        this.users = users; this.memberships = memberships; this.codes = codes;
        this.payments = payments; this.razorpay = razorpay; this.json = json;
    }

    @Transactional(readOnly = true)
    public ProMembershipView membership(Long userId) {
        return memberships.findByUserId(userId).map(this::membershipView)
                .orElseGet(() -> new ProMembershipView(false, null, null));
    }

    @Transactional(readOnly = true)
    public boolean isActive(Long userId) {
        return memberships.existsByUserIdAndExpiresAtAfter(userId, Instant.now());
    }

    @Transactional
    public ProCodeView createCode(CreateProCode input) {
        if (input.expiresAt() != null && !input.expiresAt().isAfter(Instant.now()))
            throw new InvalidExchangeException("The activation code expiry must be in the future.");
        byte[] random = new byte[18];
        RANDOM.nextBytes(random);
        String code = "CCPRO-" + Base64.getUrlEncoder().withoutPadding().encodeToString(random).toUpperCase(java.util.Locale.ROOT);
        codes.save(new ProActivationCode(hashCode(code), input.plan(), input.expiresAt()));
        return new ProCodeView(code, input.plan(), input.expiresAt());
    }

    @Transactional
    public ProMembershipView redeemCode(Long userId, RedeemProCode input) {
        UserAccount user = lockUser(userId);
        String normalized = input.code().trim().toUpperCase(java.util.Locale.ROOT);
        ProActivationCode code = codes.findForUpdate(hashCode(normalized))
                .orElseThrow(() -> new InvalidExchangeException("This activation code is invalid or has already been used."));
        Instant now = Instant.now();
        if (code.isRedeemed()) throw new InvalidExchangeException("This activation code is invalid or has already been used.");
        if (code.getExpiresAt() != null && !code.getExpiresAt().isAfter(now))
            throw new InvalidExchangeException("This activation code has expired.");
        code.redeem(user, now);
        return activate(user, code.getPlan(), "PROMO_CODE", now);
    }

    @Transactional
    public ProOrderView createOrder(@NonNull Long userId, CreateProOrder input) {
        UserAccount user = users.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User " + userId + " was not found."));
        ProPlan plan = input.plan();
        String receipt = "ccpro-" + userId + "-" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        String orderId = razorpay.createOrder(plan.getAmountPaise(), receipt,
                java.util.Map.of("user_id", userId.toString(), "plan", plan.name()));
        payments.save(new ProPayment(user, plan, orderId, plan.getAmountPaise()));
        return new ProOrderView(orderId, razorpay.keyId(), plan.getAmountPaise(), "INR", plan.name());
    }

    @Transactional
    public ProMembershipView verifyPayment(Long userId, VerifyProPayment input) {
        ProPayment existing = payments.findByRazorpayOrderId(input.orderId())
                .orElseThrow(() -> new InvalidPaymentException("The payment order was not found."));
        if (!existing.getUser().getId().equals(userId))
            throw new InvalidPaymentException("This payment order does not belong to the signed-in member.");
        razorpay.verifyCheckoutSignature(input.orderId(), input.paymentId(), input.signature());
        JsonNode payment = razorpay.fetchPayment(input.paymentId());
        validateCapturedPayment(payment, input.orderId(), existing.getAmountPaise());
        return markPaid(input.orderId(), input.paymentId());
    }

    @Transactional
    public void acceptWebhook(String body, String signature) {
        razorpay.verifyWebhookSignature(body, signature);
        try {
            JsonNode event = json.readTree(body);
            if (!"payment.captured".equals(event.path("event").asText())) return;
            JsonNode payment = event.path("payload").path("payment").path("entity");
            String orderId = payment.path("order_id").asText("");
            String paymentId = payment.path("id").asText("");
            if (orderId.isBlank() || paymentId.isBlank()) throw new InvalidPaymentException("The payment webhook is missing its order or payment ID.");
            ProPayment order = payments.findByRazorpayOrderId(orderId)
                    .orElseThrow(() -> new InvalidPaymentException("The payment order was not found."));
            validateCapturedPayment(payment, orderId, order.getAmountPaise());
            markPaid(orderId, paymentId);
        } catch (java.io.IOException e) {
            throw new InvalidPaymentException("The payment webhook body is invalid.");
        }
    }

    private ProMembershipView markPaid(String orderId, String paymentId) {
        ProPayment initial = payments.findByRazorpayOrderId(orderId)
                .orElseThrow(() -> new InvalidPaymentException("The payment order was not found."));
        UserAccount user = lockUser(initial.getUser().getId());
        ProPayment payment = payments.findForUpdate(orderId)
                .orElseThrow(() -> new InvalidPaymentException("The payment order was not found."));
        if ("PAID".equals(payment.getStatus())) {
            if (!paymentId.equals(payment.getRazorpayPaymentId()))
                throw new InvalidPaymentException("This order was already completed with a different payment.");
            return membership(user.getId());
        }
        Instant now = Instant.now();
        payment.markPaid(paymentId, now);
        return activate(user, payment.getPlan(), "RAZORPAY", now);
    }

    private void validateCapturedPayment(JsonNode payment, String expectedOrderId, int expectedAmount) {
        boolean captured = payment.path("captured").asBoolean()
                || "captured".equals(payment.path("status").asText());
        if (!expectedOrderId.equals(payment.path("order_id").asText())
                || payment.path("amount").asInt(-1) != expectedAmount
                || !"INR".equals(payment.path("currency").asText())
                || !captured) {
            throw new InvalidPaymentException("The payment is not captured for the expected order and amount.");
        }
    }

    private ProMembershipView activate(UserAccount user, ProPlan plan, String source, Instant now) {
        ProMembership membership = memberships.findForUpdate(user.getId()).orElse(null);
        Instant start = membership != null && membership.getExpiresAt().isAfter(now) ? membership.getExpiresAt() : now;
        Instant expiresAt = plan.expiresAfter(start);
        if (membership == null) membership = memberships.save(new ProMembership(user, plan, source, expiresAt));
        else membership.extend(plan, source, expiresAt);
        return membershipView(membership);
    }

    private UserAccount lockUser(Long userId) {
        return users.findForUpdate(userId).orElseThrow(() -> new ResourceNotFoundException("User " + userId + " was not found."));
    }

    private ProMembershipView membershipView(ProMembership membership) {
        Instant expiresAt = membership.getExpiresAt();
        return new ProMembershipView(expiresAt.isAfter(Instant.now()), membership.getPlan(), expiresAt);
    }

    private static String hashCode(String code) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(code.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable.", e);
        }
    }
}
