package com.mentorlink.mentorlink;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mentorlink.mentorlink.domain.Role;
import com.mentorlink.mentorlink.dto.ApplicationDtos;
import com.mentorlink.mentorlink.dto.MentorDtos;
import com.mentorlink.mentorlink.dto.ReviewDtos;
import com.mentorlink.mentorlink.dto.SessionDtos;
import com.mentorlink.mentorlink.dto.UserDtos;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApplicationWorkflowIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private ObjectMapper objectMapper;

    private HttpClient httpClient;

    @BeforeEach
    void setUp() {
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
                new MentorDtos.CreateMentorProfileRequest(
                        "백엔드 설계와 코드 리뷰 중심 멘토링",
                        "Spring Boot",
                        6
                ),
                MentorDtos.MentorResponse.class,
                201
        );

        ApplicationDtos.ApplicationResponse applicationResponse = send(
                "/api/applications",
                "POST",
                menteeToken,
                new ApplicationDtos.CreateApplicationRequest(
                        mentorResponse.mentorId(),
                        "JPA 연관관계와 트랜잭션 설계를 리뷰받고 싶습니다."
                ),
                ApplicationDtos.ApplicationResponse.class,
                201
        );

        send(
                "/api/applications/" + applicationResponse.applicationId() + "/approve",
                "PATCH",
                mentorToken,
                new ApplicationDtos.ApproveApplicationRequest(LocalDateTime.of(2026, 3, 20, 20, 0)),
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

    private String signUpAndGetToken(String email, Role role, String name) throws Exception {
        UserDtos.AuthResponse response = send(
                "/api/auth/signup",
                "POST",
                null,
                new UserDtos.SignUpRequest(name, email, "password1234", role),
                UserDtos.AuthResponse.class,
                201
        );
        return response.accessToken();
    }

    private <T> T send(String path, String method, String token, Object body, Class<T> responseType, int expectedStatus)
            throws IOException, InterruptedException {
        HttpResponse<String> response = httpClient.send(buildRequest(path, method, token, body), HttpResponse.BodyHandlers.ofString());
        assertThat(response.statusCode()).isEqualTo(expectedStatus);
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
