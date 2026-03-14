# MentorLink API Reference

## Base

- Base URL: `/api`
- Auth: `Authorization: Bearer {accessToken}`
- Content-Type: `application/json`

## Public Auth APIs

### POST `/auth/email/send-code`

회원가입용 이메일 인증 코드를 발송합니다.

Request:

```json
{
  "email": "user@example.com",
  "name": "홍길동"
}
```

### POST `/auth/email/verify`

이메일 인증 코드를 검증합니다.

Request:

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### POST `/auth/signup`

회원가입 후 즉시 인증 세션을 생성합니다.

Request:

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

로그인 후 access token과 refresh token 기반 세션을 생성합니다.

Request:

```json
{
  "email": "user@example.com",
  "password": "password1234"
}
```

### POST `/auth/refresh`

refresh token으로 access token을 재발급합니다.

### POST `/auth/logout`

refresh token을 무효화합니다.

### POST `/auth/password/reset/request`

비밀번호 재설정 코드를 이메일로 발송합니다.

Request:

```json
{
  "email": "user@example.com"
}
```

### POST `/auth/password/reset/confirm`

재설정 코드를 검증하고 비밀번호를 변경합니다.

Request:

```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newPassword1234"
}
```

## Mentor APIs

### GET `/mentors`

멘토 목록을 조회합니다. 비로그인 상태에서도 접근 가능합니다.

### GET `/mentors/{id}`

멘토 상세, 전문 분야, 후기, 예약 가능 요일을 조회합니다.

### GET `/mentors/{id}/available-slots`

멘토가 실제 신청 가능한 슬롯을 조회합니다.

### GET `/mentors/me`

내 멘토 프로필을 조회합니다.

### POST `/mentors`

멘토 프로필을 생성합니다. 멘티가 조건을 만족하면 멘토로 전향합니다.

### PATCH `/mentors/me`

멘토 프로필을 수정합니다.

## Application APIs

### POST `/applications`

멘토링 신청을 생성합니다.

정책:

- 멘티 계정만 신청 가능
- 자기 자신에게 신청 불가
- 같은 멘토에게 중복 대기 신청 불가
- 멘토 예약 가능 시간 검증

### GET `/applications/sent`

내가 보낸 신청 목록을 조회합니다.

### GET `/applications/received`

멘토가 받은 신청 목록을 조회합니다.

### POST `/applications/{id}/approve`

신청을 승인하고 세션을 생성합니다.

### POST `/applications/{id}/reject`

신청을 거절하고 거절 사유를 저장합니다.

## Session APIs

### GET `/sessions`

내 세션 목록을 조회합니다.

### POST `/sessions/{id}/complete`

세션을 완료 처리합니다.

## Review APIs

### POST `/reviews`

완료된 세션에만 후기를 작성합니다.

정책:

- 완료 세션만 가능
- 세션당 후기 1개
