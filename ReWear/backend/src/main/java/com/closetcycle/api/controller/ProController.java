package com.closetcycle.api.controller;

import com.closetcycle.api.dto.ApiDtos.*;
import com.closetcycle.api.service.ProService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pro")
public class ProController {
    private final ProService service;
    public ProController(ProService service) { this.service = service; }

    @GetMapping("/membership")
    public ProMembershipView membership(@AuthenticationPrincipal Jwt jwt) {
        return service.membership(Long.valueOf(jwt.getSubject()));
    }

    @PostMapping("/activation-codes/redeem")
    public ProMembershipView redeem(@Valid @RequestBody RedeemProCode input, @AuthenticationPrincipal Jwt jwt) {
        return service.redeemCode(Long.valueOf(jwt.getSubject()), input);
    }

    @PostMapping("/payments/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public ProOrderView createOrder(@Valid @RequestBody CreateProOrder input, @AuthenticationPrincipal Jwt jwt) {
        long userId = Long.parseLong(jwt.getSubject());
        return service.createOrder(userId, input);
    }

    @PostMapping("/payments/verify")
    public ProMembershipView verify(@Valid @RequestBody VerifyProPayment input, @AuthenticationPrincipal Jwt jwt) {
        return service.verifyPayment(Long.valueOf(jwt.getSubject()), input);
    }

    @PostMapping("/payments/webhook")
    @ResponseStatus(HttpStatus.OK)
    public void webhook(@RequestBody String body, @RequestHeader("X-Razorpay-Signature") String signature) {
        service.acceptWebhook(body, signature);
    }
}
