package com.closetcycle.api.service;

import com.closetcycle.api.error.InvalidUploadException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import java.io.IOException;
import java.io.InputStream;
import java.util.Set;
import java.util.UUID;

@Service
@Profile("prod")
public class S3ImageStorageService implements ImageStorageService {
    private static final Set<String> TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private final S3Client s3;
    private final String bucket;

    public S3ImageStorageService(S3Client s3, @Value("${closetcycle.storage.bucket}") String bucket) {
        this.s3 = s3; this.bucket = bucket;
    }

    @Override public String save(MultipartFile file) {
        String type = file.getContentType();
        if (file.isEmpty() || file.getSize() > 10 * 1024 * 1024) throw new InvalidUploadException("Choose an image smaller than 10 MB.");
        if (type == null || !TYPES.contains(type)) throw new InvalidUploadException("Only JPEG, PNG, or WebP images are accepted.");
        String ext = switch (type) { case "image/jpeg" -> ".jpg"; case "image/png" -> ".png"; default -> ".webp"; };
        String key = UUID.randomUUID() + ext;
        try (InputStream body = file.getInputStream()) {
            s3.putObject(PutObjectRequest.builder().bucket(bucket).key(key).contentType(type)
                    .serverSideEncryption("AES256").build(), RequestBody.fromInputStream(body, file.getSize()));
        } catch (IOException e) { throw new IllegalStateException("Image could not be stored", e); }
        return key;
    }

    @Override public InputStream open(String key) {
        if (key == null || !key.matches("[a-f0-9-]{36}\\.(jpg|png|webp)")) throw new IllegalArgumentException("Invalid media key");
        return s3.getObject(GetObjectRequest.builder().bucket(bucket).key(key).build());
    }
}
