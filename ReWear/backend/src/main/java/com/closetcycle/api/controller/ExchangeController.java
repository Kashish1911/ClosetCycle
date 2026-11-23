package com.closetcycle.api.controller;

import com.closetcycle.api.dto.ApiDtos.*;
import com.closetcycle.api.service.ExchangeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.AccessDeniedException;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Validated
@RestController @RequestMapping("/api/exchanges")
public class ExchangeController {
    private final ExchangeService service;
    public ExchangeController(ExchangeService service) { this.service = service; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    @Transactional public ExchangeView request(@Valid @RequestBody CreateExchange input, @AuthenticationPrincipal Jwt jwt) {
        requireIdentity(input.requesterId(), jwt);
        return ExchangeView.from(service.request(input.requesterId(), input.requestedItemId(), input.type(), input.offeredItemId()));
    }
    @GetMapping("/{id}") @Transactional(readOnly = true) public ExchangeView get(@PathVariable @NonNull Long id) { return ExchangeView.from(service.get(id)); }
    @GetMapping @Transactional(readOnly = true) public List<ExchangeView> byUser(@RequestParam @NotNull Long userId, @AuthenticationPrincipal Jwt jwt) {
        requireIdentity(userId, jwt); return service.forUser(userId).stream().map(ExchangeView::from).toList();
    }
    @PostMapping("/{id}/accept") @Transactional public ExchangeView accept(@PathVariable Long id, @RequestParam @NotNull Long ownerId, @AuthenticationPrincipal Jwt jwt) { requireIdentity(ownerId, jwt); return ExchangeView.from(service.accept(id, ownerId)); }
    @PostMapping("/{id}/decline") @Transactional public ExchangeView decline(@PathVariable Long id, @RequestParam @NotNull Long ownerId, @AuthenticationPrincipal Jwt jwt) { requireIdentity(ownerId, jwt); return ExchangeView.from(service.decline(id, ownerId)); }
    @PostMapping("/{id}/cancel") @Transactional public ExchangeView cancel(@PathVariable Long id, @RequestParam @NotNull Long requesterId, @AuthenticationPrincipal Jwt jwt) { requireIdentity(requesterId, jwt); return ExchangeView.from(service.cancel(id, requesterId)); }
    @PostMapping("/{id}/arrange") @Transactional public ExchangeView arrange(@PathVariable Long id, @RequestParam @NotNull Long participantId, @AuthenticationPrincipal Jwt jwt) { requireIdentity(participantId, jwt); return ExchangeView.from(service.arrange(id, participantId)); }
    @PostMapping("/{id}/confirm") @Transactional public ExchangeView confirm(@PathVariable Long id, @RequestParam @NotNull Long participantId, @AuthenticationPrincipal Jwt jwt) { requireIdentity(participantId, jwt); return ExchangeView.from(service.confirmCompletion(id, participantId)); }
    private void requireIdentity(Long id, Jwt jwt) {
        if (!jwt.getSubject().equals(id.toString())) throw new AccessDeniedException("The requested action must use the signed-in account.");
    }
}
