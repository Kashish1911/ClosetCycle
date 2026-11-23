package com.closetcycle.api.controller;

import com.closetcycle.api.dto.ApiDtos.*;
import com.closetcycle.api.error.ResourceNotFoundException;
import com.closetcycle.api.repo.CreditTransactionRepository;
import com.closetcycle.api.repo.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

@RestController @RequestMapping("/api/wallet")
public class WalletController {
    private final UserRepository users;
    private final CreditTransactionRepository ledger;
    public WalletController(UserRepository users, CreditTransactionRepository ledger) { this.users = users; this.ledger = ledger; }
    @GetMapping("/{userId}") public UserView balance(@PathVariable Long userId, @AuthenticationPrincipal Jwt jwt) {
        if (!jwt.getSubject().equals(userId.toString())) throw new AccessDeniedException("You can only view your own wallet.");
        var user = users.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User " + userId + " was not found."));
        return UserView.from(user);
    }
    @GetMapping("/{userId}/activity") @Transactional(readOnly = true) public List<CreditView> activity(@PathVariable Long userId, @AuthenticationPrincipal Jwt jwt) {
        if (!jwt.getSubject().equals(userId.toString())) throw new AccessDeniedException("You can only view your own wallet activity.");
        if (!users.existsById(userId)) throw new ResourceNotFoundException("User " + userId + " was not found.");
        return ledger.findByUserIdOrderByCreatedAtDesc(userId).stream().map(CreditView::from).toList();
    }
}
