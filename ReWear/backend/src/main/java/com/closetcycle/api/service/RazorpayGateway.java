package com.closetcycle.api.service;

import com.closetcycle.api.error.InvalidPaymentException;
import com.closetcycle.api.error.PaymentGatewayException;
import com.closetcycle.api.error.PaymentGatewayUnavailableException;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
public class RazorpayGateway {
    private final RestClient client;
    @NonNull private final String keyId;
    @NonNull private final String keySecret;
    @NonNull private final String webhookSecret;

    public RazorpayGateway(RestClient.Builder builder,
                           @Value("${closetcycle.razorpay.key-id:}") @NonNull String keyId,
                           @Value("${closetcycle.razorpay.key-secret:}") @NonNull String keySecret,
                           @Value("${closetcycle.razorpay.webhook-secret:}") @NonNull String webhookSecret) {
        this.client = builder.baseUrl("https://api.razorpay.com/v1").build();
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.webhookSecret = webhookSecret;
    }

    public boolean isConfigured() { return !keyId.isBlank() && !keySecret.isBlank(); }
    public String keyId() { requireCredentials(); return keyId; }

    public String createOrder(int amountPaise, String receipt, Map<String, String> notes) {
        requireCredentials();
        try {
            JsonNode result = client.post().uri("/orders")
                    .headers(headers -> headers.setBasicAuth(keyId, keySecret))
                    .body(java.util.Objects.requireNonNull(Map.of("amount", amountPaise, "currency", "INR", "receipt", receipt, "notes", notes)))
                    .retrieve().body(JsonNode.class);
            if (result == null || !result.hasNonNull("id")) throw new PaymentGatewayException("The payment provider returned an invalid order.");
            return result.get("id").asText();
        } catch (RestClientException e) {
            throw new PaymentGatewayException("The payment provider could not create an order. Please try again later.");
        }
    }

    public JsonNode fetchPayment(String paymentId) {
        requireCredentials();
        try {
            JsonNode result = client.get().uri("/payments/{id}", paymentId)
                    .headers(headers -> headers.setBasicAuth(keyId, keySecret))
                    .retrieve().body(JsonNode.class);
            if (result == null) throw new PaymentGatewayException("The payment provider returned an empty payment response.");
            return result;
        } catch (RestClientException e) {
            throw new PaymentGatewayException("The payment provider could not verify this payment. Please try again.");
        }
    }

    public void verifyCheckoutSignature(String orderId, String paymentId, String signature) {
        requireCredentials();
        if (!constantTimeEquals(hmac(orderId + "|" + paymentId, keySecret), signature))
            throw new InvalidPaymentException("The payment signature is invalid.");
    }

    public void verifyWebhookSignature(String body, String signature) {
        if (webhookSecret.isBlank()) throw new PaymentGatewayUnavailableException("The Razorpay webhook secret is not configured.");
        if (!constantTimeEquals(hmac(body, webhookSecret), signature))
            throw new InvalidPaymentException("The payment webhook signature is invalid.");
    }

    private void requireCredentials() {
        if (!isConfigured()) throw new PaymentGatewayUnavailableException("Razorpay is not configured. Set the server-side Razorpay key ID and key secret before enabling checkout.");
    }

    private static String hmac(String value, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException("HMAC-SHA256 is unavailable.", e);
        }
    }

    private static boolean constantTimeEquals(String expected, String supplied) {
        if (supplied == null) return false;
        return MessageDigest.isEqual(expected.getBytes(StandardCharsets.US_ASCII),
                supplied.toLowerCase(java.util.Locale.ROOT).getBytes(StandardCharsets.US_ASCII));
    }
}
