package com.closetcycle.api.controller;

import com.closetcycle.api.dto.ApiDtos.CreateProCode;
import com.closetcycle.api.dto.ApiDtos.ProCodeView;
import com.closetcycle.api.service.ProService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/pro-codes")
public class AdminProCodeController {
    private final ProService service;
    public AdminProCodeController(ProService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProCodeView create(@Valid @RequestBody CreateProCode input) {
        return service.createCode(input);
    }
}
