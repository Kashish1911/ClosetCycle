package com.closetcycle.api.error;

public class PaymentGatewayUnavailableException extends RuntimeException {
    public PaymentGatewayUnavailableException(String message) { super(message); }
}
