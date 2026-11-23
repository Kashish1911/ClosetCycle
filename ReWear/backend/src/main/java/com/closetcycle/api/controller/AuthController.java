package com.closetcycle.api.controller;

import com.closetcycle.api.dto.ApiDtos.*;
import com.closetcycle.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AuthService service;
    public AuthController(AuthService service) { this.service = service; }
    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED) public AuthView register(@Valid @RequestBody CreateUser input) { return service.register(input); }
    @PostMapping("/login") public AuthView login(@Valid @RequestBody Login input) { return service.login(input); }
}
