# MentorLink - Docker 사용법

## 현재 구조 요약

| 구분 | 위치 | 로컬 연결 | 비고 |
|------|------|-----------|------|
| **프론트엔드** | `frontend/` | `http://localhost:3000` | Next.js 16, API 호출은 `NEXT_PUBLIC_API_URL` 또는 기본 `http://localhost:8080/api` |
| **백엔드** | 없음 (예정) | `http://localhost:8080` | Spring Boot 예정, 현재는 프론트 목 데이터 사용 |
| **DB** | Docker MySQL | `localhost:3306` | docker-compose로 실행, DB명 `mentorlink` |

### 로컬 연결 관계

- **로컬 개발**: `npm run dev` (frontend) → 브라우저 3000번, API는 8080번(백엔드 미구현 시 목업).
- **환경 변수**: `frontend/.env.local`에 `NEXT_PUBLIC_API_URL=http://localhost:8080/api` 설정 시 백엔드 연동.
- **Docker**: 프론트 컨테이너는 `NEXT_PUBLIC_API_URL=http://host.docker.internal:8080/api`로 호스트의 8080 포트(백엔드)에 접근.

---

## Docker로 실행

### 요구사항

- Docker, Docker Compose 설치

### 실행

```bash
# MentorLink 루트에서
docker compose up -d

# 빌드만 (캐시 없이)
docker compose build --no-cache
docker compose up -d
```

### 접속

- **프론트**: http://localhost:3000
- **MySQL**: `localhost:3306` (유저: `mentorlink` / 비밀번호: `mentorlink_secret`)

### 중지

```bash
docker compose down
```

---

## 백엔드 추가 시

1. `backend/`에 Spring Boot 프로젝트 추가.
2. `docker-compose.yml`에서 `backend` 서비스 주석 해제 후 `frontend`의 `NEXT_PUBLIC_API_URL`를 `http://backend:8080/api`로 변경.
3. `docker compose up -d` 재실행.
