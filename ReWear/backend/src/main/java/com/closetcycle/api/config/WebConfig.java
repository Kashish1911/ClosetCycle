package com.closetcycle.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Objects;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${closetcycle.upload-dir:./uploads}") private String uploadDirectory;
    @Value("${closetcycle.allowed-origins:http://localhost:5173,http://localhost:4173,http://localhost:8443}") private String allowedOrigins;
    @Override public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins(Objects.requireNonNull(
                        Arrays.stream(allowedOrigins.split(",")).map((@NonNull String origin) -> origin.trim()).toArray(String[]::new)))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS").allowedHeaders("Authorization", "Content-Type");
    }
    @Override public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        String location = Paths.get(uploadDirectory).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/uploads/**").addResourceLocations(location);
    }
}
