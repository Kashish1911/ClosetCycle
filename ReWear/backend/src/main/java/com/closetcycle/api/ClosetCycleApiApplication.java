package com.closetcycle.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ClosetCycleApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClosetCycleApiApplication.class, args);
    }
}
