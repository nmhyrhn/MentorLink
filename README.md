# MentorLink

멘토와 멘티를 연결하는 매칭 플랫폼 백엔드/프론트엔드 모노레포입니다.

## Backend (Spring Boot)

핵심 기능:
- 회원가입/로그인 (`/auth/signup`, `/auth/login`)
- 멘토 프로필 등록/조회 (`POST /mentors`, `GET /mentors`)
- 멘토링 신청/승인 (`POST /applications`, `PATCH /applications/{id}/approve`)
- 세션 생성 (`POST /sessions`)
- 리뷰 작성 (`POST /reviews`)

도메인 상태값:
- Application: `PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`
- Session: `SCHEDULED`, `FINISHED`, `CANCELLED`

### 실행

```bash
cd backend
./gradlew bootRun
```

### 테스트

```bash
cd backend
./gradlew test
```

## Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```
