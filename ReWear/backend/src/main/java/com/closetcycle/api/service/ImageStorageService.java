package com.closetcycle.api.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;

public interface ImageStorageService {
    String save(MultipartFile file);
    InputStream open(String key) throws IOException;
}
