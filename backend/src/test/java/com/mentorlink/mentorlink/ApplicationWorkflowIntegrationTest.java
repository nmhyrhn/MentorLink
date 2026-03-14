package com.mentorlink.mentorlink;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mentorlink.mentorlink.domain.EmailVerification;
import com.mentorlink.mentorlink.domain.Role;
import com.mentorlink.mentorlink.dto.ApplicationDtos;
import com.mentorlink.mentorlink.dto.MentorDtos;
import com.mentorlink.mentorlink.dto.ReviewDtos;
import com.mentorlink.mentorlink.dto.SessionDtos;
import com.mentorlink.mentorlink.dto.UserDtos;
import com.mentorlink.mentorlink.repository.EmailVerificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.time.temporal.TemporalAdjusters;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestMailConfig.class)
class ApplicationWorkflowIntegrationTest {

    @LocalServerPort
    private int port;

    private ObjectMapper objectMapper;

    @Autowired
    private EmailVerificationRepository emailVerificationRepository;

    private HttpClient httpClient;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().findAndRegisterModules();
        httpClient = HttpClient.newHttpClient();
    }

    @Test
    void mentorApplicationWorkflow_createsSessionAndReview() throws Exception {
        String mentorToken = signUpAndGetToken("mentor@mentorlink.dev", Role.MENTOR, "멘토 사용자");
        String menteeToken = signUpAndGetToken("mentee@mentorlink.dev", Role.MENTEE, "멘티 사용자");

        MentorDtos.MentorResponse mentorResponse = send(
                "/api/mentors/profile",
                "POST",
                mentorToken,
                new MentorDtos.UpsertMentorProfileRequest(
                        "백엔드 설계와 코드 리뷰 중심 멘토링",
                        "Spring Boot",
                        6,
                        List.of("JPA", "API 설계"),
                        List.of(
                                new MentorDtos.AvailabilityRuleRequest(
                                        DayOfWeek.MONDAY,
                                        "09:00",
                                        "12:00"
                                )
                        )
                ),
                MentorDtos.MentorResponse.class,
                201
        );

        LocalDate nextAvailableDate = LocalDate.now().with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
        LocalDateTime preferredAt = nextAvailableDate.atTime(9, 0);
        if (!preferredAt.isAfter(LocalDateTime.now())) {
            preferredAt = LocalDate.now()
                    .with(TemporalAdjusters.next(DayOfWeek.MONDAY))
                    .atTime(9, 0);
        }
        ApplicationDtos.ApplicationResponse applicationResponse = send(
                "/api/applications",
                "POST",
                menteeToken,
                new ApplicationDtos.CreateApplicationRequest(
                        mentorResponse.mentorId(),
                        "JPA 연관관계와 트랜잭션 설계를 리뷰받고 싶습니다.",
                        preferredAt,
                        preferredAt.plusMinutes(60),
                        60,
                        "mentee@mentorlink.dev"
                ),
                ApplicationDtos.ApplicationResponse.class,
                201
        );

        send(
                "/api/applications/" + applicationResponse.applicationId() + "/approve",
                "PATCH",
                mentorToken,
                new ApplicationDtos.ApproveApplicationRequest(preferredAt),
                ApplicationDtos.ApplicationResponse.class,
                200
        );

        List<SessionDtos.SessionResponse> sessions = sendList(
                "/api/sessions/me",
                menteeToken,
                new TypeReference<>() {
                },
                200
        );

        assertThat(sessions).hasSize(1);
        SessionDtos.SessionResponse session = sessions.get(0);

        send(
                "/api/sessions/" + session.sessionId() + "/complete",
                "PATCH",
                menteeToken,
                null,
                SessionDtos.SessionResponse.class,
                200
        );

        ReviewDtos.ReviewResponse reviewResponse = send(
                "/api/reviews",
                "POST",
                menteeToken,
                new ReviewDtos.CreateReviewRequest(
                        session.sessionId(),
                        5,
                        "실서비스 수준의 피드백을 받을 수 있었던 세션이었습니다."
                ),
                ReviewDtos.ReviewResponse.class,
                201
        );

        assertThat(reviewResponse.rating()).isEqualTo(5);
    }

    @Test
    void menteeWithActiveApplication_cannotBecomeMentor() throws Exception {
        String existingMentorToken = signUpAndGetToken("existing-mentor@mentorlink.dev", Role.MENTOR, "기존 멘토");
        String menteeToken = signUpAndGetToken("active-mentee@mentorlink.dev", Role.MENTEE, "활성 멘티");

        MentorDtos.MentorResponse mentorResponse = send(
                "/api/mentors/profile",
                "POST",
                existingMentorToken,
                new MentorDtos.UpsertMentorProfileRequest(
                        "테스트 멘토",
                        "Backend",
                        5,
                        List.of("Spring"),
                        List.of(new MentorDtos.AvailabilityRuleRequest(DayOfWeek.MONDAY, "09:00", "12:00"))
                ),
                MentorDtos.MentorResponse.class,
                201
        );

        LocalDate nextAvailableDate = LocalDate.now().with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
        LocalDateTime preferredAt = nextAvailableDate.atTime(9, 0);
        if (!preferredAt.isAfter(LocalDateTime.now())) {
            preferredAt = LocalDate.now()
                    .with(TemporalAdjusters.next(DayOfWeek.MONDAY))
                    .atTime(9, 0);
        }

        send(
                "/api/applications",
                "POST",
                menteeToken,
                new ApplicationDtos.CreateApplicationRequest(
                        mentorResponse.mentorId(),
                        "진행 중 신청이 있습니다.",
                        preferredAt,
                        preferredAt.plusMinutes(60),
                        60,
                        "active-mentee@mentorlink.dev"
                ),
                ApplicationDtos.ApplicationResponse.class,
                201
        );

        HttpResponse<String> response = httpClient.send(
                buildRequest(
                        "/api/mentors/profile",
                        "POST",
                        menteeToken,
                        new MentorDtos.UpsertMentorProfileRequest(
                                "멘토 전향 시도",
                                "Spring Boot",
                                3,
                                List.of("JPA"),
                                List.of(new MentorDtos.AvailabilityRuleRequest(DayOfWeek.TUESDAY, "10:00", "12:00"))
                        )
                ),
                HttpResponse.BodyHandlers.ofString()
        );

        assertThat(response.statusCode()).isEqualTo(400);
        assertThat(response.body()).contains("예정 세션 또는 진행 중인 멘토링 신청이 있으면 멘토로 전향할 수 없습니다.");
    }

    @Test
    void passwordReset_changesPasswordAndAllowsNewLogin() throws Exception {
        String email = "reset-user@mentorlink.dev";
        seedVerifiedEmail(email);
        send(
                "/api/auth/signup",
                "POST",
                null,
                new UserDtos.SignUpRequest("비밀번호 재설정 사용자", email, "password1234", Role.MENTEE, "000000"),
                UserDtos.AuthResponse.class,
                201
        );

        UserDtos.MessageResponse requestResponse = send(
                "/api/auth/password/reset/request",
                "POST",
                null,
                new UserDtos.PasswordResetRequest(email),
                UserDtos.MessageResponse.class,
                200
        );

        assertThat(requestResponse.message()).contains("비밀번호 재설정 코드");
        assertThat(requestResponse.debugCode()).isNotBlank();

        UserDtos.MessageResponse resetResponse = send(
                "/api/auth/password/reset/confirm",
                "POST",
                null,
                new UserDtos.PasswordResetConfirmRequest(email, requestResponse.debugCode(), "newPassword123"),
                UserDtos.MessageResponse.class,
                200
        );

        assertThat(resetResponse.message()).contains("비밀번호가 재설정되었습니다");

        UserDtos.AuthResponse loginResponse = send(
                "/api/auth/login",
                "POST",
                null,
                new UserDtos.LoginRequest(email, "newPassword123"),
                UserDtos.AuthResponse.class,
                200
        );

        assertThat(loginResponse.user().email()).isEqualTo(email);
    }

    private String signUpAndGetToken(String email, Role role, String name) throws Exception {
        seedVerifiedEmail(email);
        UserDtos.AuthResponse response = send(
                "/api/auth/signup",
                "POST",
                null,
                new UserDtos.SignUpRequest(name, email, "password1234", role, "000000"),
                UserDtos.AuthResponse.class,
                201
        );
        return response.accessToken();
    }

    private void seedVerifiedEmail(String email) {
        emailVerificationRepository.save(
                EmailVerification.builder()
                        .email(email)
                        .code("000000")
                        .expiresAt(LocalDateTime.now().plusMinutes(10))
                        .verified(true)
                        .build()
        );
    }

    private <T> T send(String path, String method, String token, Object body, Class<T> responseType, int expectedStatus)
            throws IOException, InterruptedException {
        HttpResponse<String> response = httpClient.send(buildRequest(path, method, token, body), HttpResponse.BodyHandlers.ofString());
        assertThat(response.statusCode())
                .withFailMessage(
                        "Expected status %s but got %s for %s %s. Body: %s",
                        expectedStatus,
                        response.statusCode(),
                        method,
                        path,
                        response.body()
                )
                .isEqualTo(expectedStatus);
        return objectMapper.readValue(response.body(), responseType);
    }

    private <T> List<T> sendList(String path, String token, TypeReference<List<T>> typeReference, int expectedStatus)
            throws IOException, InterruptedException {
        HttpResponse<String> response = httpClient.send(buildRequest(path, "GET", token, null), HttpResponse.BodyHandlers.ofString());
        assertThat(response.statusCode()).isEqualTo(expectedStatus);
        return objectMapper.readValue(response.body(), typeReference);
    }

    private HttpRequest buildRequest(String path, String method, String token, Object body) throws IOException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json");

        if (token != null) {
            builder.header("Authorization", "Bearer " + token);
        }

        if (body == null) {
            return builder.method(method, HttpRequest.BodyPublishers.noBody()).build();
        }

        return builder.method(method, HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body))).build();
    }
}
