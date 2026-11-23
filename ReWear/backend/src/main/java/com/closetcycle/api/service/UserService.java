package com.closetcycle.api.service;

import com.closetcycle.api.dto.ApiDtos.CreateUser;
import com.closetcycle.api.error.ResourceNotFoundException;
import com.closetcycle.api.model.UserAccount;
import com.closetcycle.api.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    public UserService(UserRepository users, PasswordEncoder passwordEncoder) { this.users = users; this.passwordEncoder = passwordEncoder; }
    @Transactional public UserAccount create(CreateUser input) {
        String email = input.email().trim().toLowerCase();
        if (users.findByEmail(email).isPresent()) throw new com.closetcycle.api.error.InvalidExchangeException("An account with this email already exists.");
        var user = new UserAccount(input.displayName().trim(), email, input.area().trim());
        user.setPasswordHash(passwordEncoder.encode(input.password()));
        return users.save(user);
    }
    @Transactional(readOnly = true) public UserAccount get(@NonNull Long id) {
        return users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User " + id + " was not found."));
    }
    @Transactional public UserAccount updateProfile(@NonNull Long id, com.closetcycle.api.dto.ApiDtos.UpdateProfile input) {
        var user = users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User " + id + " was not found."));
        user.setDisplayName(input.displayName().trim()); user.setArea(input.area().trim()); return user;
    }
}
