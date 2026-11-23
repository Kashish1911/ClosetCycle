package com.closetcycle.api.error;

public class InvalidUploadException extends RuntimeException {
    public InvalidUploadException(String message) { super(message); }
}
