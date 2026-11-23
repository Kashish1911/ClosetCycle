package com.closetcycle.api.error;

public class PaymentGatewayException extends RuntimeException {
    public PaymentGatewayException(String message) { super(message); }
}
