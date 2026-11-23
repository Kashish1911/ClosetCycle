package com.closetcycle.api.error;

public class InvalidPaymentException extends RuntimeException {
    public InvalidPaymentException(String message) { super(message); }
}
