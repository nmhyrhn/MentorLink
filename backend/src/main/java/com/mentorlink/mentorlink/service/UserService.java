package com.mentorlink.mentorlink.service;

import com.mentorlink.mentorlink.domain.User;
import com.mentorlink.mentorlink.dto.UserDtos;
import com.mentorlink.mentorlink.exception.BadRequestException;
import com.mentorlink.mentorlink.exception.NotFoundException;
import com.mentorlink.mentorlink.repository.UserRepository;
import com.mentorlink.mentorlink.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailVerificationService emailVerificationService;
    private final AuthRateLimitService authRateLimitService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public UserDtos.MessageResponse sendVerificationCode(UserDtos.EmailVerificationRequest request) {
        validateEmailAvailable(request.email());
        authRateLimitService.assertEmailSendAllowed(request.email());

        emailVerificationService.sendVerificationCode(request.email(), request.name());
        return new UserDtos.MessageResponse("인증 코드를 이메일로 발송했습니다.", null);
    }

    @Transactional
    public UserDtos.MessageResponse verifyEmailCode(UserDtos.VerifyEmailCodeRequest request) {
        emailVerificationService.verifyCode(request.email(), request.code());
        return new UserDtos.MessageResponse("이메일 인증이 완료되었습니다.", null);
    }

    @Transactional
    public AuthSession signUp(UserDtos.SignUpRequest request) {
        validateEmailAvailable(request.email());
        emailVerificationService.verifyCode(request.email(), request.verificationCode());

        User user = userRepository.save(User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .verified(true)
                .build());

        return createAuthSession(user);
    }

    @Transactional
    public AuthSession login(UserDtos.LoginRequest request) {
        authRateLimitService.assertLoginAllowed(request.email());

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> {
                    authRateLimitService.recordLoginFailure(request.email());
                    return new NotFoundException("사용자를 찾을 수 없습니다.");
                });

        if (!user.isVerified()) {
            throw new BadRequestException("이메일 인증이 완료되지 않은 계정입니다.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            authRateLimitService.recordLoginFailure(request.email());
            throw new BadRequestException("비밀번호가 일치하지 않습니다.");
        }

        authRateLimitService.resetLoginFailures(request.email());
        return createAuthSession(user);
    }

    @Transactional
    public AuthSession refresh(String rawRefreshToken) {
        User user = refreshTokenService.getUserFromRefreshToken(rawRefreshToken);
        String rotatedRefreshToken = refreshTokenService.rotate(rawRefreshToken);
        return new AuthSession(buildAuthResponse(user), rotatedRefreshToken);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    @Transactional(readOnly = true)
    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public UserDtos.UserResponse getMyProfile(Long userId) {
        return toResponse(findById(userId));
    }

    private void validateEmailAvailable(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("이미 사용 중인 이메일입니다.");
        }
    }

    private AuthSession createAuthSession(User user) {
        String refreshToken = refreshTokenService.issue(user);
        return new AuthSession(buildAuthResponse(user), refreshToken);
    }

    private UserDtos.AuthResponse buildAuthResponse(User user) {
        return new UserDtos.AuthResponse(
                jwtTokenProvider.generateToken(user.getUserId(), user.getEmail(), user.getRole()),
                toResponse(user)
        );
    }

    private UserDtos.UserResponse toResponse(User user) {
        return new UserDtos.UserResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isVerified()
        );
    }

    public record AuthSession(
            UserDtos.AuthResponse response,
            String refreshToken
    ) {
    }
}
