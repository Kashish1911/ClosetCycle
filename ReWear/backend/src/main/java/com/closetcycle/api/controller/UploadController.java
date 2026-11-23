package com.closetcycle.api.controller;

import com.closetcycle.api.service.ImageStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController @RequestMapping("/api/files")
public class UploadController {
    private final ImageStorageService storage;
    public UploadController(ImageStorageService storage) { this.storage = storage; }
    @PostMapping("/images") @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) { return Map.of("url", "/api/media/" + storage.save(file)); }
}
