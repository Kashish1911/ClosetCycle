package com.closetcycle.api.controller;

import com.closetcycle.api.service.ImageStorageService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.Objects;

@RestController
public class MediaController {
    private static final Map<String, MediaType> TYPES = Map.of("jpg", MediaType.IMAGE_JPEG, "png", MediaType.IMAGE_PNG, "webp", MediaType.parseMediaType("image/webp"));
    private final ImageStorageService storage;
    public MediaController(ImageStorageService storage) { this.storage = storage; }

    @GetMapping("/api/media/{key}")
    public ResponseEntity<InputStreamResource> get(@PathVariable String key) throws IOException {
        String ext = key.substring(key.lastIndexOf('.') + 1);
        MediaType type = TYPES.get(ext);
        if (type == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok().contentType(type).cacheControl(CacheControl.maxAge(Objects.requireNonNull(Duration.ofDays(7))).cachePublic())
                .body(new InputStreamResource(Objects.requireNonNull(storage.open(key), "Image storage returned no stream.")));
    }
}
