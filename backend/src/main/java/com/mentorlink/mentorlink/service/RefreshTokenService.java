package com.mentorlink.mentorlink.service;

import com.mentorlink.mentorlink.domain.RefreshToken;
import com.mentorlink.mentorlink.domain.User;
import com.mentorlink.mentorlink.exception.BadRequestException;
import com.mentorlink.mentorlink.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.auth.refresh-token.expiration-days:14}")
    private long refreshTokenExpirationDays;

    @Transactional
    public String issue(User user) {
        revokeAllForUser(user.getUserId());

        String rawToken = UUID.randomUUID() + "." + UUID.randomUUID();
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .tokenHash(hash(rawToken))
                .expiresAt(LocalDateTime.now().plusDays(refreshTokenExpirationDays))
                .revoked(false)
                .build());

        return rawToken;
    }

    @Transactional
    public String rotate(String rawToken) {
        RefreshToken refreshToken = findValidToken(rawToken);
        User user = refreshToken.getUser();

        refreshToken.revoke();
        String newRawToken = UUID.randomUUID() + "." + UUID.randomUUID();
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .tokenHash(hash(newRawToken))
                .expiresAt(LocalDateTime.now().plusDays(refreshTokenExpirationDays))
                .revoked(false)
                .build());
        return newRawToken;
    }

    @Transactional(readOnly = true)
    public User getUserFromRefreshToken(String rawToken) {
        return findValidToken(rawToken).getUser();
    }

    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByTokenHashAndRevokedFalse(hash(rawToken))
                .ifPresent(RefreshToken::revoke);
    }

    @Transactional
    public void revokeAllForUser(Long userId) {
        refreshTokenRepository.findByUserUserIdAndRevokedFalse(userId)
                .forEach(RefreshToken::revoke);
    }

    private RefreshToken findValidToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new BadRequestException("리프레시 토큰이 없습니다. 다시 로그인해 주세요.");
        }

        RefreshToken refreshToken = refreshTokenRepository.findByTokenHashAndRevokedFalse(hash(rawToken))
                .orElseThrow(() -> new BadRequestException("유효하지 않은 리프레시 토큰입니다. 다시 로그인해 주세요."));

        if (refreshToken.isExpired()) {
            refreshToken.revoke();
            throw new BadRequestException("세션이 만료되었습니다. 다시 로그인해 주세요.");
        }

        return refreshToken;
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm is not available.", ex);
        }
    }
}
