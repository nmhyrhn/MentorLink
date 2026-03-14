# MentorLink ERD

```mermaid
erDiagram
    USERS ||--o| MENTOR_PROFILES : has
    USERS ||--o{ APPLICATIONS : sends
    MENTOR_PROFILES ||--o{ APPLICATIONS : receives
    APPLICATIONS ||--o| SESSIONS : creates
    SESSIONS ||--o| REVIEWS : has
    USERS ||--o{ REFRESH_TOKENS : owns
    USERS ||--o{ EMAIL_VERIFICATIONS : verifies

    USERS {
        bigint user_id PK
        varchar name
        varchar email UK
        varchar password
        varchar role
        boolean verified
        datetime created_at
    }

    MENTOR_PROFILES {
        bigint mentor_id PK
        bigint user_id FK UK
        varchar field
        int career_year
        text expertise
        text bio
        varchar avatar
        datetime created_at
    }

    APPLICATIONS {
        bigint application_id PK
        bigint mentor_id FK
        bigint mentee_id FK
        varchar status
        text message
        varchar contact
        datetime preferred_at
        datetime preferred_end_at
        int duration_minutes
        text rejected_reason
        datetime created_at
    }

    SESSIONS {
        bigint session_id PK
        bigint application_id FK UK
        datetime scheduled_at
        datetime end_at
        int duration_minutes
        varchar status
        datetime created_at
    }

    REVIEWS {
        bigint review_id PK
        bigint session_id FK UK
        int rating
        text comment
        datetime created_at
    }

    REFRESH_TOKENS {
        bigint refresh_token_id PK
        bigint user_id FK
        varchar token_hash UK
        boolean revoked
        datetime expires_at
        datetime created_at
    }

    EMAIL_VERIFICATIONS {
        bigint email_verification_id PK
        varchar email
        varchar code
        boolean verified
        datetime expires_at
        datetime created_at
    }
```

## 설계 포인트

- `User`와 `MentorProfile`을 분리해 계정 정보와 멘토 활동 정보를 구분
- `Application` 중심으로 신청 -> 승인 -> 세션 흐름을 관리
- `Session`과 `Review`는 각각 1:1 제약으로 운영
- `RefreshToken`은 서버에서 revoke 가능한 구조로 유지
