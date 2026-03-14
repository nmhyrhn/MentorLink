package com.mentorlink.mentorlink.service;

import com.mentorlink.mentorlink.domain.EmailVerification;
import com.mentorlink.mentorlink.exception.BadRequestException;
import com.mentorlink.mentorlink.repository.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.port:}")
    private String mailPort;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable:false}")
    private boolean startTlsEnabled;

    @Value("${spring.mail.properties.mail.smtp.starttls.required:false}")
    private boolean startTlsRequired;

    @Value("${spring.mail.properties.mail.smtp.ssl.trust:}")
    private String sslTrust;

    @Value("${spring.mail.properties.mail.smtp.ssl.protocols:}")
    private String sslProtocols;

    @Value("${app.email.verification-expiration-minutes}")
    private long expirationMinutes;

    @Value("${app.email.debug-fallback:true}")
    private boolean debugFallbackEnabled;

    @Transactional
    public String sendVerificationCode(String email, String name) {
        return sendCode(email, name, "[MentorLink] 이메일 인증 코드", """
                안녕하세요, %s님.

                MentorLink 회원가입 인증 코드는 %s 입니다.
                인증 코드는 %d분 동안 유효합니다.
                """);
    }

    @Transactional
    public String sendPasswordResetCode(String email, String name) {
        return sendCode(email, name, "[MentorLink] 비밀번호 재설정 코드", """
                안녕하세요, %s님.

                MentorLink 비밀번호 재설정 코드는 %s 입니다.
                인증 코드는 %d분 동안 유효합니다.
                """);
    }

    private String sendCode(String email, String name, String subject, String template) {
        String code = String.format("%06d", new Random().nextInt(1_000_000));
        emailVerificationRepository.save(
                EmailVerification.builder()
                        .email(email)
                        .code(code)
                        .expiresAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                        .verified(false)
                        .build()
        );

        boolean smtpConfigured = mailHost != null && !mailHost.isBlank()
                && mailUsername != null && !mailUsername.isBlank()
                && mailPassword != null && !mailPassword.isBlank();

        if (!smtpConfigured) {
            if (debugFallbackEnabled) {
                log.info("SMTP not configured; returning verification code in response (debug fallback).");
                return code;
            }
            throw new BadRequestException("이메일 인증 SMTP 설정이 비어 있습니다. MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD를 확인해 주세요.");
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setFrom(mailUsername);
            message.setSubject(subject);
            message.setText(template.formatted(name, code, expirationMinutes));
            mailSender.send(message);
            log.info("Verification email sent successfully to {} via {}:{}", email, mailHost, mailPort);
            return null;
        } catch (MailAuthenticationException ex) {
            log.warn(
                    "SMTP authentication failed for {} via {}:{} | startTlsEnabled={} startTlsRequired={} sslTrust={} sslProtocols={} | causes={}",
                    mailUsername,
                    mailHost,
                    mailPort,
                    startTlsEnabled,
                    startTlsRequired,
                    sslTrust,
                    sslProtocols,
                    buildCauseChain(ex),
                    ex
            );
            if (debugFallbackEnabled) {
                return code;
            }
            throw new BadRequestException("SMTP 인증에 실패했습니다. Gmail 계정의 2단계 인증과 앱 비밀번호 설정을 다시 확인해 주세요.");
        } catch (MailException ex) {
            log.warn(
                    "SMTP mail send failed for {} via {}:{} | startTlsEnabled={} startTlsRequired={} sslTrust={} sslProtocols={} | causes={}",
                    mailUsername,
                    mailHost,
                    mailPort,
                    startTlsEnabled,
                    startTlsRequired,
                    sslTrust,
                    sslProtocols,
                    buildCauseChain(ex),
                    ex
            );
            if (debugFallbackEnabled) {
                return code;
            }
            throw new BadRequestException("인증 메일 발송에 실패했습니다. SMTP 서버 설정을 확인해 주세요.");
        } catch (Throwable ex) {
            log.warn("Unexpected error sending verification email | causes={}", buildCauseChain(ex), ex);
            if (debugFallbackEnabled) {
                return code;
            }
            throw new BadRequestException("인증 메일 발송 중 예기치 못한 오류가 발생했습니다.");
        }
    }

    @Transactional
    public void verifyCode(String email, String code) {
        EmailVerification verification = emailVerificationRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new BadRequestException("먼저 이메일 인증 코드를 발송해 주세요."));

        if (verification.isVerified()) {
            return;
        }

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("인증 코드가 만료되었습니다. 다시 발송해 주세요.");
        }

        if (!verification.getCode().equals(code)) {
            throw new BadRequestException("인증 코드가 올바르지 않습니다.");
        }

        verification.setVerified(true);
    }

    private String buildCauseChain(Throwable throwable) {
        List<String> causes = new ArrayList<>();
        Throwable current = throwable;

        while (current != null) {
            causes.add(current.getClass().getSimpleName() + ": " + current.getMessage());
            current = current.getCause();
        }

        return String.join(" -> ", causes);
    }
}
