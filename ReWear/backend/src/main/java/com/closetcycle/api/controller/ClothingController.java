package com.closetcycle.api.controller;

import com.closetcycle.api.dto.ApiDtos.*;
import com.closetcycle.api.service.ClothingService;
import com.closetcycle.api.model.ItemStatus;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.AccessDeniedException;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

@RestController @RequestMapping("/api/items")
public class ClothingController {
    private final ClothingService service;
    public ClothingController(ClothingService service) { this.service = service; }
    @GetMapping @Transactional(readOnly = true) public List<ItemView> browse(@RequestParam(required = false) String q, @RequestParam(required = false) String category,
            @RequestParam(required = false) String size, @RequestParam(required = false) String condition,
            @RequestParam(required = false) String color, @RequestParam(required = false) Integer maxCredits) {
        return service.browse(q, category, size, condition, color, maxCredits).stream().map(ItemView::from).toList();
    }
    @GetMapping("/{id}") @Transactional(readOnly = true) public ItemView get(@PathVariable @NonNull Long id) { return ItemView.from(service.get(id)); }
    @GetMapping("/owner/{userId}") @Transactional(readOnly = true) public List<ItemView> byOwner(@PathVariable Long userId, @AuthenticationPrincipal Jwt jwt) {
        if (!jwt.getSubject().equals(userId.toString())) throw new AccessDeniedException("You can only view your own listings.");
        return service.byOwner(userId).stream().map(ItemView::from).toList();
    }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Transactional public ItemView create(@Valid @RequestBody CreateItem input, @AuthenticationPrincipal Jwt jwt) {
        if (!jwt.getSubject().equals(input.ownerId().toString())) throw new AccessDeniedException("A listing must belong to the signed-in user.");
        return ItemView.from(service.create(input));
    }
    @PutMapping("/{id}") @Transactional public ItemView update(@PathVariable Long id, @Valid @RequestBody CreateItem input, @AuthenticationPrincipal Jwt jwt) {
        if (!jwt.getSubject().equals(input.ownerId().toString())) throw new AccessDeniedException("A listing must belong to the signed-in user.");
        return ItemView.from(service.update(id, input));
    }
    @PatchMapping("/{id}/status") @Transactional public ItemView changeStatus(@PathVariable Long id, @RequestParam Long ownerId,
            @RequestParam ItemStatus status, @AuthenticationPrincipal Jwt jwt) {
        if (!jwt.getSubject().equals(ownerId.toString())) throw new AccessDeniedException("A listing must belong to the signed-in user.");
        return ItemView.from(service.changeStatus(id, ownerId, status));
    }
}
