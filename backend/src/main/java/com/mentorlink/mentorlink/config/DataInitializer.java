package com.mentorlink.mentorlink.config;

import com.mentorlink.mentorlink.domain.Application;
import com.mentorlink.mentorlink.domain.ApplicationStatus;
import com.mentorlink.mentorlink.domain.MentorProfile;
import com.mentorlink.mentorlink.domain.MentoringSession;
import com.mentorlink.mentorlink.domain.Review;
import com.mentorlink.mentorlink.domain.Role;
import com.mentorlink.mentorlink.domain.SessionStatus;
import com.mentorlink.mentorlink.domain.User;
import com.mentorlink.mentorlink.repository.ApplicationRepository;
import com.mentorlink.mentorlink.repository.EmailVerificationRepository;
import com.mentorlink.mentorlink.repository.MentorProfileRepository;
import com.mentorlink.mentorlink.repository.MentoringSessionRepository;
import com.mentorlink.mentorlink.repository.RefreshTokenRepository;
import com.mentorlink.mentorlink.repository.ReviewRepository;
import com.mentorlink.mentorlink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@ConditionalOnProperty(name = "app.mock-data.enabled", havingValue = "true")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String DEFAULT_IMAGE_URL = "/default-mentor.svg";
    private static final String DEMO_MENTEE_EMAIL = "mentee.demo@mentorlink.dev";

    private final UserRepository userRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final MentoringSessionRepository mentoringSessionRepository;
    private final ReviewRepository reviewRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.mock-data.reset-on-startup:false}")
    private boolean resetOnStartup;

    @Override
    @Transactional
    public void run(String... args) {
        if (resetOnStartup) {
            resetToMockData();
        } else if (userRepository.findByEmail(DEMO_MENTEE_EMAIL).isPresent()) {
            return;
        }

        User demoMentee = createUser("오하린", "mentee.demo@mentorlink.dev", Role.MENTEE);
        User secondMentee = createUser("김서진", "mentee.second@mentorlink.dev", Role.MENTEE);
        User thirdMentee = createUser("박도윤", "mentee.third@mentorlink.dev", Role.MENTEE);

        List<MentorProfile> mentors = List.of(
                createMentor("김민서", "backend.junior@mentorlink.dev", "백엔드 개발", 2, "주니어 백엔드 개발자로 성장하려는 멘티에게 Spring 입문, JPA 기초, API 설계 리뷰를 차분하게 도와드립니다.", List.of("Java", "Spring Boot", "JPA"), rules("MONDAY|19:00|21:00", "WEDNESDAY|19:00|22:00", "SATURDAY|10:00|12:00")),
                createMentor("이도현", "backend.senior@mentorlink.dev", "백엔드 아키텍처", 11, "대규모 트래픽 환경에서 Java와 Spring Boot 아키텍처를 설계해 온 경험을 바탕으로 실무적인 피드백을 드립니다.", List.of("MSA", "트랜잭션", "MySQL"), rules("TUESDAY|18:00|21:00", "THURSDAY|19:00|22:00")),
                createMentor("박채린", "frontend.react@mentorlink.dev", "프론트엔드 개발", 5, "React와 Next.js 기반 서비스 개발 경험을 바탕으로 화면 구조와 상태 관리, 협업 관점의 피드백을 드립니다.", List.of("React", "Next.js", "TypeScript"), rules("MONDAY|14:00|17:00", "THURSDAY|15:00|18:00")),
                createMentor("최현우", "devops.aws@mentorlink.dev", "DevOps / AWS", 8, "Docker, EC2, CI/CD, Nginx 배포까지 연결되는 흐름을 실무 관점에서 설명해 드립니다.", List.of("Docker", "AWS", "Nginx"), rules("TUESDAY|10:00|13:00", "FRIDAY|20:00|22:00")),
                createMentor("정수빈", "product.design@mentorlink.dev", "프로덕트 디자인", 6, "서비스 문제 정의부터 UX 개선, 화면 설계까지 제품 중심으로 멘토링합니다.", List.of("Figma", "UX Writing", "프로덕트 사고"), rules("WEDNESDAY|13:00|16:00", "SATURDAY|14:00|17:00")),
                createMentor("서예린", "ux.design@mentorlink.dev", "UX 리서치", 4, "사용자 인터뷰와 리서치 문서 정리, 포트폴리오 스토리텔링을 함께 다듬습니다.", List.of("사용자 인터뷰", "리서치", "프로토타이핑"), rules("MONDAY|10:00|12:00", "THURSDAY|10:00|12:30")),
                createMentor("한다은", "data.engineer@mentorlink.dev", "데이터 엔지니어링", 7, "ETL 구조, SQL 튜닝, 데이터 파이프라인 설계를 실제 운영 관점에서 설명합니다.", List.of("SQL", "ETL", "Airflow"), rules("TUESDAY|20:00|22:00", "FRIDAY|19:00|22:00")),
                createMentor("강서준", "android.mobile@mentorlink.dev", "안드로이드 개발", 5, "Kotlin 기반 안드로이드 아키텍처와 앱 포트폴리오 방향성을 함께 정리합니다.", List.of("Kotlin", "Android", "Jetpack"), rules("WEDNESDAY|18:00|21:00", "SUNDAY|14:00|17:00")),
                createMentor("윤소희", "ios.mobile@mentorlink.dev", "iOS 개발", 9, "Swift와 iOS 설계 경험을 바탕으로 앱 구조 개선과 기술 면접 준비를 돕습니다.", List.of("Swift", "UIKit", "SwiftUI"), rules("THURSDAY|18:00|21:00", "SATURDAY|19:00|21:00")),
                createMentor("임태경", "qa.automation@mentorlink.dev", "QA 자동화", 10, "테스트 코드, API 자동화, 품질 관리 프로세스를 안정적으로 만드는 방법을 공유합니다.", List.of("JUnit", "Selenium", "API Test"), rules("MONDAY|17:00|19:00", "FRIDAY|17:00|19:30"))
        );

        seedWorkflowData(mentors, demoMentee, secondMentee, thirdMentee);
    }

    private void resetToMockData() {
        reviewRepository.deleteAllInBatch();
        mentoringSessionRepository.deleteAllInBatch();
        applicationRepository.deleteAllInBatch();
        mentorProfileRepository.deleteAllInBatch();
        emailVerificationRepository.deleteAllInBatch();
        refreshTokenRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
    }

    private User createUser(String name, String email, Role role) {
        return userRepository.save(User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode("password1234"))
                .role(role)
                .verified(true)
                .build());
    }

    private MentorProfile createMentor(
            String name,
            String email,
            String field,
            int careerYear,
            String bio,
            List<String> expertise,
            String availabilityRulesCsv
    ) {
        User user = createUser(name, email, Role.MENTOR);
        return mentorProfileRepository.save(MentorProfile.builder()
                .user(user)
                .bio(bio)
                .field(field)
                .careerYear(careerYear)
                .imageUrl(DEFAULT_IMAGE_URL)
                .expertiseCsv(String.join(",", expertise))
                .availabilityRulesCsv(availabilityRulesCsv)
                .build());
    }

    private void seedWorkflowData(List<MentorProfile> mentors, User demoMentee, User secondMentee, User thirdMentee) {
        createApplication(mentors.get(0), demoMentee, ApplicationStatus.PENDING, "Spring Boot API 설계 피드백을 받고 싶습니다.", "oharin@example.com", next(DayOfWeek.MONDAY, 19, 0), 60, null);
        createApplication(mentors.get(1), demoMentee, ApplicationStatus.APPROVED, "트랜잭션 처리와 서비스 계층 분리를 리뷰받고 싶습니다.", "oharin@example.com", next(DayOfWeek.TUESDAY, 18, 0), 90, null);
        createApplication(mentors.get(2), demoMentee, ApplicationStatus.COMPLETED, "프론트엔드와 백엔드 연결 구조를 점검받고 싶습니다.", "oharin@example.com", previous(DayOfWeek.MONDAY, 14, 0), 60, "구조를 아주 명확하게 설명해 주셔서 도움이 많이 되었습니다.");

        createApplication(mentors.get(3), secondMentee, ApplicationStatus.PENDING, "AWS와 Docker 배포 흐름을 학습하고 싶습니다.", "010-1234-5678", next(DayOfWeek.TUESDAY, 10, 30), 60, null);
        createApplication(mentors.get(4), secondMentee, ApplicationStatus.APPROVED, "포트폴리오 화면 설계와 UX 방향을 상담받고 싶습니다.", "kimseojin@example.com", next(DayOfWeek.SATURDAY, 14, 0), 120, null);

        createApplication(mentors.get(5), thirdMentee, ApplicationStatus.REJECTED, "리서치 결과를 문서로 정리하는 방법을 배우고 싶습니다.", "010-9876-5432", next(DayOfWeek.THURSDAY, 10, 0), 60, null);
        createApplication(mentors.get(6), thirdMentee, ApplicationStatus.COMPLETED, "데이터 파이프라인 구조와 SQL 튜닝 상담을 받고 싶습니다.", "parkdoyun@example.com", previous(DayOfWeek.FRIDAY, 19, 0), 90, "실무 기준으로 설명해 주셔서 이해가 훨씬 쉬웠습니다.");
    }

    private void createApplication(
            MentorProfile mentor,
            User mentee,
            ApplicationStatus status,
            String message,
            String contact,
            LocalDateTime preferredAt,
            int durationMinutes,
            String reviewComment
    ) {
        LocalDateTime preferredEndAt = preferredAt.plusMinutes(durationMinutes);

        Application application = applicationRepository.save(Application.builder()
                .mentor(mentor)
                .mentee(mentee)
                .status(status)
                .message(message)
                .contact(contact)
                .preferredAt(preferredAt)
                .preferredEndAt(preferredEndAt)
                .durationMinutes(durationMinutes)
                .rejectedReason(status == ApplicationStatus.REJECTED ? "일정이 맞지 않아 이번에는 진행이 어렵습니다." : null)
                .build());

        if (status == ApplicationStatus.APPROVED || status == ApplicationStatus.COMPLETED) {
            MentoringSession session = mentoringSessionRepository.save(MentoringSession.builder()
                    .application(application)
                    .scheduledAt(preferredAt)
                    .endAt(preferredEndAt)
                    .durationMinutes(durationMinutes)
                    .status(status == ApplicationStatus.COMPLETED ? SessionStatus.FINISHED : SessionStatus.SCHEDULED)
                    .build());

            if (status == ApplicationStatus.COMPLETED && reviewComment != null) {
                reviewRepository.save(Review.builder()
                        .session(session)
                        .rating(5)
                        .comment(reviewComment)
                        .build());
            }
        }
    }

    private String rules(String... entries) {
        return String.join(";", entries);
    }

    private LocalDateTime next(DayOfWeek dayOfWeek, int hour, int minute) {
        LocalDate date = LocalDate.now();
        while (date.getDayOfWeek() != dayOfWeek || !date.atTime(hour, minute).isAfter(LocalDateTime.now())) {
            date = date.plusDays(1);
        }
        return date.atTime(LocalTime.of(hour, minute));
    }

    private LocalDateTime previous(DayOfWeek dayOfWeek, int hour, int minute) {
        LocalDate date = LocalDate.now();
        while (date.getDayOfWeek() != dayOfWeek || !date.atTime(hour, minute).isBefore(LocalDateTime.now())) {
            date = date.minusDays(1);
        }
        return date.atTime(LocalTime.of(hour, minute));
    }
}
