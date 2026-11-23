package com.closetcycle.api.service;

import com.closetcycle.api.error.InvalidUploadException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
@Profile("!prod")
public class LocalFileStorageService implements ImageStorageService {
    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp");
    private final Path root;
    public LocalFileStorageService(@Value("${closetcycle.upload-dir:./uploads}") String directory) {
        root = Paths.get(directory).toAbsolutePath().normalize();
        try { Files.createDirectories(root); } catch (IOException e) { throw new IllegalStateException("Could not create upload directory", e); }
    }
    @Override public String save(MultipartFile file) {
        if (file.isEmpty() || file.getSize() > 10 * 1024 * 1024) throw new InvalidUploadException("Choose an image smaller than 10 MB.");
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED.contains(contentType)) throw new InvalidUploadException("Only JPEG, PNG, or WebP images are accepted.");
        String extension = switch (contentType) { case "image/jpeg" -> ".jpg"; case "image/png" -> ".png"; default -> ".webp"; };
        String name = UUID.randomUUID() + extension;
        try { Files.copy(file.getInputStream(), root.resolve(name), StandardCopyOption.REPLACE_EXISTING); }
        catch (IOException e) { throw new IllegalStateException("Image could not be saved", e); }
        return name;
    }

    @Override public java.io.InputStream open(String key) throws IOException {
        if (key == null || !key.matches("[a-f0-9-]{36}\\.(jpg|png|webp)")) throw new java.nio.file.NoSuchFileException("media");
        Path file = root.resolve(key).normalize();
        if (!file.getParent().equals(root) || !Files.isRegularFile(file)) throw new java.nio.file.NoSuchFileException("media");
        return Files.newInputStream(file);
    }
}
