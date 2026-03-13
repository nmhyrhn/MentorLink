# MentorLink API 명세

## 개요

- Base URL: `/api`
- 인증 방식: `Authorization: Bearer {JWT}`
- 응답 포맷: `application/json`
- 공개 API를 제외한 나머지 엔드포인트는 JWT 인증이 필요합니다.

## 인증 / 회원

### POST `/auth/email/send-code`

- 설명: 회원가입용 이메일 인증 코드를 발송합니다.
- 인증: 불필요

요청 예시:

```json
{
  "email": "user@example.com",
  "name": "홍길동"
}
```

응답 예시:

```json
{
  "message": "인증 코드를 이메일로 발송했습니다.",
  "debugCode": null
}
```

### POST `/auth/email/verify`

- 설명: 이메일 인증 코드를 검증합니다.
- 인증: 불필요

요청 예시:

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### POST `/auth/signup`

- 설명: 회원가입 후 즉시 JWT를 발급합니다.
- 인증: 불필요

요청 예시:

```json
{
  "name": "홍길동",
  "email": "user@example.com",
  "password": "password1234",
  "role": "MENTEE",
  "verificationCode": "123456"
}
```

### POST `/auth/login`

- 설명: 로그인 후 JWT를 발급합니다.
- 인증: 불필요

요청 예시:

```json
{
  "email": "user@example.com",
  "password": "password1234"
}
```

응답 예시:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "userId": 1,
    "name": "홍길동",
    "email": "user@example.com",
    "role": "MENTEE",
    "verified": true
  }
}
```

### GET `/auth/me`

- 설명: 현재 로그인한 사용자 정보를 조회합니다.
- 인증: 필요

## 멘토

### GET `/mentors`

- 설명: 멘토 목록을 조회합니다.
- 인증: 불필요

### GET `/mentors/{id}`

- 설명: 특정 멘토 상세 정보를 조회합니다.
- 인증: 불필요

### GET `/mentors/{id}/available-slots`

- 설명: 멘토의 예약 가능 슬롯을 조회합니다.
- 인증: 불필요

응답 필드:

- `startAt`: 예약 시작 시각
- `endAt`: 예약 종료 시각
- `maxDurationMinutes`: 해당 슬롯에서 선택 가능한 최대 상담 시간
- `durationOptions`: 선택 가능한 상담 시간 목록. 30분 단위로 제공

### POST `/mentors/profile`

- 설명: 멘토 프로필을 최초 등록합니다.
- 인증: 필요

### PUT `/mentors/me/profile`

- 설명: 내 멘토 프로필을 수정합니다.
- 인증: 필요

요청 예시:

```json
{
  "bio": "Spring Boot와 JPA 중심으로 멘토링합니다.",
  "field": "백엔드 개발",
  "careerYear": 5,
  "expertise": ["Java", "Spring Boot", "JPA"],
  "availabilityRules": [
    {
      "dayOfWeek": "TUESDAY",
      "startTime": "18:00",
      "endTime": "21:00"
    },
    {
      "dayOfWeek": "THURSDAY",
      "startTime": "19:00",
      "endTime": "22:00"
    }
  ]
}
```

### GET `/mentors/me/profile`

- 설명: 내 멘토 프로필을 조회합니다.
- 인증: 필요

## 멘토링 신청

### POST `/applications`

- 설명: 멘티가 멘토링을 신청합니다.
- 인증: 필요

요청 예시:

```json
{
  "mentorId": 2,
  "message": "트랜잭션 설계 피드백을 받고 싶습니다.",
  "preferredAt": "2026-03-20T19:00:00",
  "preferredEndAt": "2026-03-20T20:30:00",
  "durationMinutes": 90,
  "contact": "mentee@example.com"
}
```

비즈니스 규칙:

- 자기 자신에게는 신청할 수 없습니다.
- 멘토의 예약 가능 시간 안에서만 신청할 수 있습니다.
- 같은 시간대에 이미 점유된 슬롯은 신청할 수 없습니다.

### PATCH `/applications/{id}/approve`

- 설명: 멘토가 신청을 승인합니다.
- 인증: 필요

요청 예시:

```json
{
  "scheduledAt": "2026-03-20T19:00:00"
}
```

동작:

- `Application.status`를 `APPROVED`로 변경
- `Session`을 1건 생성

### PATCH `/applications/{id}/reject`

- 설명: 멘토가 신청을 거절합니다.
- 인증: 필요

요청 예시:

```json
{
  "reason": "해당 시간에는 일정이 어렵습니다."
}
```

### GET `/applications/me/sent`

- 설명: 내가 보낸 신청 내역을 조회합니다.
- 인증: 필요

### GET `/applications/me/received`

- 설명: 내가 받은 신청 내역을 조회합니다.
- 인증: 필요

## 세션

### GET `/sessions/me`

- 설명: 내 세션 목록을 조회합니다.
- 인증: 필요

- 멘토: 승인된 상담 예정 내역, 완료 내역 확인
- 멘티: 본인의 상담 예정 내역, 완료 내역 확인

### PATCH `/sessions/{id}/complete`

- 설명: 세션을 완료 처리합니다.
- 인증: 필요

## 리뷰

### POST `/reviews`

- 설명: 멘티가 완료된 세션에 대해 후기를 작성합니다.
- 인증: 필요

요청 예시:

```json
{
  "sessionId": 10,
  "rating": 5,
  "comment": "실무 관점 설명이 명확해서 도움이 컸습니다."
}
```

비즈니스 규칙:

- 완료된 세션에 대해서만 작성 가능합니다.
- 세션당 리뷰는 1회만 작성 가능합니다.
- 작성된 리뷰는 멘토 상세 조회 시 공개됩니다.

## 주요 상태값

### `ApplicationStatus`

- `PENDING`
- `APPROVED`
- `REJECTED`
- `COMPLETED`
- `CANCELLED`

### `SessionStatus`

- `SCHEDULED`
- `FINISHED`
- `CANCELLED`
