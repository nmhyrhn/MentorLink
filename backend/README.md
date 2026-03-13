# MentorLink Backend (Spring Boot)

## 1) 프로젝트 개요
MentorLink는 멘토-멘티 매칭 플랫폼으로, **신청 → 승인/거절 → 세션 → 리뷰** 흐름을 중심으로 동작합니다.

## 2) 전체 패키지 구조
- `global`: config, exception, response, security/jwt
- `domain/auth`: 회원가입/로그인
- `domain/user`: User 엔티티/저장소
- `domain/mentor`: MentorProfile 등록/조회
- `domain/application`: 신청 생성/조회/승인/거절
- `domain/session`: 세션 조회/종료
- `domain/review`: 리뷰 작성

## 3) ERD 텍스트 설명
- `users (id, name, email, password, role, created_at)`
- `mentor_profiles (id, user_id unique, field, bio, career_year, created_at)`
- `applications (id, mentor_id, mentee_id, message, preferred_scheduled_at, status, created_at)`
- `sessions (id, application_id unique, scheduled_at, status, created_at)`
- `reviews (id, session_id unique, rating, comment, created_at)`

관계:
- User(mentor) 1:N Application
- User(mentee) 1:N Application
- User 1:1 MentorProfile
- Application 1:1 Session
- Session 1:1 Review

## 4) 엔티티 코드
- `User`, `MentorProfile`, `Application`, `Session`, `Review`
- `BaseTimeEntity`로 `createdAt` 공통 처리
- `ApplicationStatus`, `SessionStatus`, `UserRole` enum 적용

## 5) DTO 코드
요청/응답 DTO를 엔티티와 분리:
- Auth: `SignUpRequest`, `LoginRequest`, `AuthResponse`
- Mentor: `CreateMentorProfileRequest`, `MentorResponse`
- Application: `CreateApplicationRequest`, `ApplicationResponse`
- Session: `SessionResponse`
- Review: `CreateReviewRequest`, `ReviewResponse`

## 6) Repository 코드
- Spring Data JPA 기반 Repository 구성
- N+1 완화를 위해 주요 조회에 fetch join 적용 (`ApplicationRepository`, `SessionRepository`)

## 7) Service 코드
- Service 계층에서 비즈니스 규칙 처리
- 신청 승인 시 `Application.status=APPROVED` 변경 + `Session` 생성을 **한 트랜잭션**에서 처리
- 세션 종료 시 `Session=FINISHED`, `Application=COMPLETED`
- 리뷰는 `FINISHED` 세션에서 해당 멘티만 작성 가능

## 8) Controller 코드
요구 API 구현:
- Auth: `POST /api/auth/signup`, `POST /api/auth/login`
- Mentor: `POST /api/mentors/profile`, `GET /api/mentors`, `GET /api/mentors/{mentorId}`
- Application: `POST /api/applications`, `GET /api/applications/sent`, `GET /api/applications/received`, `PATCH /api/applications/{id}/approve`, `PATCH /api/applications/{id}/reject`
- Session: `GET /api/sessions`, `PATCH /api/sessions/{id}/finish`
- Review: `POST /api/reviews`

## 9) Security / JWT 코드
- `JwtTokenProvider`: 토큰 생성/검증
- `JwtAuthenticationFilter`: Bearer 토큰 파싱 후 SecurityContext 저장
- `SecurityConfig`: 인증/인가 경로 설정
- `CorsConfig`: 프론트(React/Next.js) 연동용 CORS 허용

## 10) 예외 처리 코드
- `@RestControllerAdvice` 기반 전역 예외 처리
- 에러 응답: `timestamp`, `status`, `error`, `message`, `path`
- 중복 이메일, 리소스 없음, 권한 없음, 이미 처리된 신청, 종료 전 리뷰 작성 등 처리

## 11) application.yml 예시
- MySQL datasource
- JPA ddl-auto/update
- JWT secret/만료시간
- springdoc(swagger-ui) 경로

## 12) Swagger 설정
- springdoc-openapi 사용
- Bearer JWT Security Scheme 설정
- `/swagger-ui/index.html`에서 테스트 가능

## 13) Dockerfile 예시
- 멀티스테이지(Gradle build → JRE run)
- `EXPOSE 8080`

## 14) 실행 방법
```bash
cd backend
./gradlew bootRun
```

Swagger:
- `http://localhost:8080/swagger-ui/index.html`

## 15) API 예시 요청/응답
### 회원가입
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "mentorA",
  "email": "mentor@test.com",
  "password": "1234",
  "role": "MENTOR"
}
```
응답:
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "name": "mentorA",
    "email": "mentor@test.com",
    "role": "MENTOR",
    "accessToken": "..."
  },
  "message": "회원가입 성공"
}
```

### 신청 생성
```http
POST /api/applications
Authorization: Bearer {token}
Content-Type: application/json

{
  "mentorId": 1,
  "message": "백엔드 커리어 멘토링 부탁드립니다.",
  "scheduledAt": "2026-01-01T20:00:00"
}
```

### 리뷰 작성
```http
POST /api/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "sessionId": 10,
  "rating": 5,
  "comment": "실무적인 조언이 좋았습니다."
}
```

## 16) 면접/역리뷰용 핵심 설명 포인트
1. **User와 MentorProfile 분리 이유**
   - 인증/계정 책임(User)과 도메인 프로필 책임(MentorProfile)을 분리해 확장성과 정규화를 확보.
2. **Application이 핵심 엔티티인 이유**
   - 멘토-멘티 관계를 직접 연결하지 않고 신청 상태를 중심으로 수명주기를 관리.
3. **승인 로직 트랜잭션 이유**
   - 승인 상태 변경과 세션 생성이 분리되면 데이터 불일치가 발생할 수 있어 원자성 보장 필요.
4. **DTO 분리 이유**
   - 엔티티 노출 방지, API 스펙 안정화, 프론트와의 계약 명확화.
5. **Enum 상태값 사용 이유**
   - 상태 전이를 코드 레벨에서 명확히 제한하고 오타/매직스트링 리스크를 제거.
6. **ATS 유사성**
   - ATS의 지원→합격/불합격→온보딩/평가 흐름과 구조적으로 유사하며,
     본 프로젝트는 이를 멘토링 도메인(신청→승인→세션→리뷰)에 맞게 치환.
