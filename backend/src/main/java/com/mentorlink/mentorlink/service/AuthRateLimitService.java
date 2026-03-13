package com.mentorlink.mentorlink.service;

import com.mentorlink.mentorlink.exception.TooManyRequestsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthRateLimitService {

    private final ConcurrentHashMap<String, RateLimitWindow> emailSendWindows = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, RateLimitWindow> loginFailureWindows = new ConcurrentHashMap<>();

    private final int loginMaxAttempts;
    private final Duration loginWindow;
    private final int emailSendMaxAttempts;
    private final Duration emailSendWindow;

    public AuthRateLimitService(
            @Value("${app.auth.login-rate-limit.max-attempts:5}") int loginMaxAttempts,
            @Value("${app.auth.login-rate-limit.window-minutes:10}") long loginWindowMinutes,
            @Value("${app.auth.email-send-rate-limit.max-attempts:5}") int emailSendMaxAttempts,
            @Value("${app.auth.email-send-rate-limit.window-minutes:10}") long emailSendWindowMinutes
    ) {
        this.loginMaxAttempts = loginMaxAttempts;
        this.loginWindow = Duration.ofMinutes(loginWindowMinutes);
        this.emailSendMaxAttempts = emailSendMaxAttempts;
        this.emailSendWindow = Duration.ofMinutes(emailSendWindowMinutes);
    }

    public void assertEmailSendAllowed(String email) {
        String key = normalize(email);
        RateLimitWindow window = emailSendWindows.compute(key, (ignored, current) -> nextWindow(current, emailSendWindow));

        if (window.attempts() >= emailSendMaxAttempts) {
            throw new TooManyRequestsException("이메일 인증 코드는 10분 동안 최대 5회까지 발송할 수 있습니다.");
        }

        emailSendWindows.put(key, window.incremented());
    }

    public void assertLoginAllowed(String email) {
        String key = normalize(email);
        RateLimitWindow window = loginFailureWindows.compute(key, (ignored, current) -> nextWindow(current, loginWindow));

        if (window.attempts() >= loginMaxAttempts) {
            throw new TooManyRequestsException("로그인 시도는 10분 동안 최대 5회까지 가능합니다. 잠시 후 다시 시도해 주세요.");
        }
    }

    public void recordLoginFailure(String email) {
        String key = normalize(email);
        loginFailureWindows.compute(key, (ignored, current) -> nextWindow(current, loginWindow).incremented());
    }

    public void resetLoginFailures(String email) {
        loginFailureWindows.remove(normalize(email));
    }

    private String normalize(String raw) {
        return raw == null ? "" : raw.trim().toLowerCase();
    }

    private RateLimitWindow nextWindow(RateLimitWindow current, Duration duration) {
        LocalDateTime now = LocalDateTime.now();
        if (current == null || current.startedAt().plus(duration).isBefore(now)) {
            return new RateLimitWindow(now, 0);
        }
        return current;
    }

    private record RateLimitWindow(LocalDateTime startedAt, int attempts) {
        private RateLimitWindow incremented() {
            return new RateLimitWindow(startedAt, attempts + 1);
        }
    }
}
