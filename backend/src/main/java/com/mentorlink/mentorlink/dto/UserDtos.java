package com.mentorlink.mentorlink.dto;

import com.mentorlink.mentorlink.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UserDtos {

    private static final String STRICT_EMAIL_REGEX = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";

    public record EmailVerificationRequest(
            @Email @Pattern(regexp = STRICT_EMAIL_REGEX, message = "이메일은 example@domain.com 형식이어야 합니다.") @NotBlank String email,
            @NotBlank String name
    ) {
    }

    public record SignUpRequest(
            @NotBlank String name,
            @Email @Pattern(regexp = STRICT_EMAIL_REGEX, message = "이메일은 example@domain.com 형식이어야 합니다.") @NotBlank String email,
            @NotBlank @Size(min = 8) String password,
            @NotNull Role role,
            @NotBlank String verificationCode
        ) {
    }

    public record VerifyEmailCodeRequest(
            @Email @Pattern(regexp = STRICT_EMAIL_REGEX, message = "이메일은 example@domain.com 형식이어야 합니다.") @NotBlank String email,
            @NotBlank String code
    ) {
    }

    public record PasswordResetRequest(
            @Email @Pattern(regexp = STRICT_EMAIL_REGEX, message = "이메일은 example@domain.com 형식이어야 합니다.") @NotBlank String email
    ) {
    }

    public record PasswordResetConfirmRequest(
            @Email @Pattern(regexp = STRICT_EMAIL_REGEX, message = "이메일은 example@domain.com 형식이어야 합니다.") @NotBlank String email,
            @NotBlank String code,
            @NotBlank @Size(min = 8) String newPassword
    ) {
    }

    public record LoginRequest(
            @Email @Pattern(regexp = STRICT_EMAIL_REGEX, message = "이메일은 example@domain.com 형식이어야 합니다.") @NotBlank String email,
            @NotBlank String password
    ) {
    }

    public record UserResponse(
            Long userId,
            String name,
            String email,
            Role role,
            boolean verified
    ) {
    }

    public record AuthResponse(
            String accessToken,
            UserResponse user
    ) {
    }

    public record LogoutResponse(
            String message
    ) {
    }

    public record MessageResponse(
            String message,
            String debugCode
    ) {
    }
}
