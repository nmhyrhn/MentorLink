package com.mentorlink.mentorlink.controller;

import com.mentorlink.mentorlink.dto.UserDtos;
import com.mentorlink.mentorlink.security.CustomUserDetails;
import com.mentorlink.mentorlink.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "mentorlink_refresh_token";

    private final UserService userService;

    @Value("${app.auth.refresh-token.secure:false}")
    private boolean refreshTokenCookieSecure;

    @PostMapping("/email/send-code")
    public UserDtos.MessageResponse sendEmailVerificationCode(@RequestBody @Valid UserDtos.EmailVerificationRequest request) {
        return userService.sendVerificationCode(request);
    }

    @PostMapping("/email/verify")
    public UserDtos.MessageResponse verifyEmailCode(@RequestBody @Valid UserDtos.VerifyEmailCodeRequest request) {
        return userService.verifyEmailCode(request);
    }

    @PostMapping("/password/reset/request")
    public UserDtos.MessageResponse requestPasswordReset(@RequestBody @Valid UserDtos.PasswordResetRequest request) {
        return userService.sendPasswordResetCode(request);
    }

    @PostMapping("/password/reset/confirm")
    public UserDtos.MessageResponse confirmPasswordReset(@RequestBody @Valid UserDtos.PasswordResetConfirmRequest request) {
        return userService.resetPassword(request);
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDtos.AuthResponse signUp(
            @RequestBody @Valid UserDtos.SignUpRequest request,
            HttpServletResponse response
    ) {
        UserService.AuthSession authSession = userService.signUp(request);
        attachRefreshTokenCookie(response, authSession.refreshToken());
        return authSession.response();
    }

    @PostMapping("/login")
    public UserDtos.AuthResponse login(
            @RequestBody @Valid UserDtos.LoginRequest request,
            HttpServletResponse response
    ) {
        UserService.AuthSession authSession = userService.login(request);
        attachRefreshTokenCookie(response, authSession.refreshToken());
        return authSession.response();
    }

    @PostMapping("/refresh")
    public UserDtos.AuthResponse refresh(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        UserService.AuthSession authSession = userService.refresh(extractRefreshToken(request));
        attachRefreshTokenCookie(response, authSession.refreshToken());
        return authSession.response();
    }

    @PostMapping("/logout")
    public UserDtos.LogoutResponse logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        userService.logout(extractRefreshToken(request));
        clearRefreshTokenCookie(response);
        return new UserDtos.LogoutResponse("로그아웃되었습니다.");
    }

    @GetMapping("/me")
    public UserDtos.UserResponse me(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return userService.getMyProfile(userDetails.userId());
    }

    private String extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void attachRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(refreshTokenCookieSecure)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(60L * 60 * 24 * 14)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(refreshTokenCookieSecure)
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
