package com.closetcycle.api.error;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<?> missing(ResourceNotFoundException e) { return response(HttpStatus.NOT_FOUND, message(e)); }
    @ExceptionHandler(InvalidCredentialsException.class)
    ResponseEntity<?> unauthorized(InvalidCredentialsException e) { return response(HttpStatus.UNAUTHORIZED, message(e)); }
    @ExceptionHandler(PaymentGatewayUnavailableException.class)
    ResponseEntity<?> paymentUnavailable(PaymentGatewayUnavailableException e) { return response(HttpStatus.SERVICE_UNAVAILABLE, message(e)); }
    @ExceptionHandler(PaymentGatewayException.class)
    ResponseEntity<?> paymentGateway(PaymentGatewayException e) { return response(HttpStatus.BAD_GATEWAY, message(e)); }
    @ExceptionHandler(InvalidPaymentException.class)
    ResponseEntity<?> invalidPayment(InvalidPaymentException e) { return response(HttpStatus.CONFLICT, message(e)); }
    @ExceptionHandler(InvalidUploadException.class)
    ResponseEntity<?> invalidUpload(InvalidUploadException e) { return response(HttpStatus.BAD_REQUEST, message(e)); }
    @ExceptionHandler({InvalidExchangeException.class, InsufficientCreditsException.class})
    ResponseEntity<?> invalid(RuntimeException e) { return response(HttpStatus.CONFLICT, message(e)); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> invalidInput(MethodArgumentNotValidException e) {
        var errors = e.getBindingResult().getFieldErrors().stream().map(x -> x.getField() + ": " + x.getDefaultMessage()).toList();
        return ResponseEntity.badRequest().body(Map.of("timestamp", Instant.now(), "status", 400, "errors", errors));
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<?> duplicate(DataIntegrityViolationException e) { return response(HttpStatus.CONFLICT, "A record with that unique value already exists."); }
    private ResponseEntity<?> response(@NonNull HttpStatus status, @NonNull String message) {
        return ResponseEntity.status(status).body(Map.of("timestamp", Instant.now(), "status", status.value(), "error", message));
    }
    @NonNull private static String message(Throwable error) {
        String message = error.getMessage();
        return message == null ? "Request could not be completed." : message;
    }
}
