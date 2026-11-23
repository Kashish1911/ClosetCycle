package com.closetcycle.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.beans.factory.annotation.Value;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@Profile("prod")
public class S3Config {
    @Bean S3Client s3Client(@Value("${AWS_REGION:ap-south-1}") String region) {
        return S3Client.builder().region(Region.of(region)).build();
    }
}
