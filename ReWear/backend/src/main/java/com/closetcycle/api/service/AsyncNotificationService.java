package com.closetcycle.api.service;

import com.closetcycle.api.repo.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AsyncNotificationService implements NotificationService {
    private static final Logger log = LoggerFactory.getLogger(AsyncNotificationService.class);
    @Override @Async("notificationExecutor")
    public void notifyUser(Long userId, String message) {
        log.info("Async closetcycle notification for user {}: {}", userId, message);
    }
}
