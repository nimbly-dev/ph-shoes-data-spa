package com.nimbly.phshoesbackend.util;

import dev.failsafe.Failsafe;
import dev.failsafe.RetryPolicy;
import dev.failsafe.event.ExecutionAttemptedEvent;
import dev.failsafe.event.ExecutionCompletedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeoutException;
import java.util.function.Supplier;


@Slf4j
@Component
public class AiRetry {
    private final RetryPolicy<Object> policy = RetryPolicy.<Object>builder()
            .handle(IOException.class, TimeoutException.class)
            .withDelay(Duration.ofSeconds(2))
            .withMaxAttempts(3)
            .onFailedAttempt((ExecutionAttemptedEvent<Object> evt) ->
                            log.warn("AI attempt #{} failed: {}", evt.getAttemptCount(),
                                    evt.getLastException().getMessage())
            )
            .onRetriesExceeded((ExecutionCompletedEvent<Object> evt) ->
                    log.error("AI retries exhausted. Final error: {}", evt.getException().getMessage())
            )
            .build();


    public <T> T withRetry(Supplier<T> call) {
        try {
            return Failsafe.with(policy).get(call::get);
        } catch (Exception e) {
            log.error("AI request failed: {}", e.getMessage());
            throw new RuntimeException("AI request failed", e);
        }
    }
}
