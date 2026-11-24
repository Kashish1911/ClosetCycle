package com.closetcycle.api.controller;

import com.closetcycle.api.dto.ApiDtos.AdminUserView;
import com.closetcycle.api.dto.ApiDtos.UpdateUserRole;
import com.closetcycle.api.error.ResourceNotFoundException;
import com.closetcycle.api.repo.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    private final UserRepository users;

    public AdminUserController(UserRepository users) {
        this.users = users;
    }

    @GetMapping
    public List<AdminUserView> list() {
        return users.findAll().stream().map(AdminUserView::from).toList();
    }

    @PatchMapping("/{id}/role")
    public AdminUserView updateRole(@PathVariable Long id, @Valid @RequestBody UpdateUserRole input,
                                    @AuthenticationPrincipal Jwt jwt) {
        var user = users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User " + id + " was not found."));
        if (jwt.getSubject().equals(id.toString()) && input.role() != user.getRole()) {
            throw new IllegalArgumentException("You cannot change your own role.");
        }
        user.setRole(input.role());
        return AdminUserView.from(users.save(user));
    }
}
