package com.closetcycle.api.controller;

import com.closetcycle.api.dto.ApiDtos.*;
import com.closetcycle.api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/users")
public class UserController {
    private final UserService service;
    public UserController(UserService service) { this.service = service; }
    @GetMapping("/{id}") public UserView get(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        if (!jwt.getSubject().equals(id.toString()) && !jwt.getClaimAsStringList("roles").contains("MODERATOR")) throw new AccessDeniedException("You can only view your own profile.");
        return UserView.from(service.get(id));
    }
    @PutMapping("/{id}") public UserView update(@PathVariable Long id, @Valid @RequestBody UpdateProfile input, @AuthenticationPrincipal Jwt jwt) {
        if (!jwt.getSubject().equals(id.toString())) throw new AccessDeniedException("You can only update your own profile.");
        return UserView.from(service.updateProfile(id, input));
    }
}
