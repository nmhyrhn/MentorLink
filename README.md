# MentorLink

MentorLink는 멘티가 멘토를 탐색하고 멘토링을 신청한 뒤, 멘토가 승인하면 세션이 생성되고 완료된 세션에만 후기를 남길 수 있는 매칭형 멘토링 플랫폼입니다.

## 핵심 기능

- 이메일 인증 기반 회원가입
- JWT Access Token + Refresh Token 로그인
- 비밀번호 재설정
- 멘토 목록/상세 조회
- 멘토링 신청, 승인, 거절
- 예정 세션/완료 세션 관리
- 완료 세션 전용 후기 작성
- 멘티의 멘토 전향
  - 진행 중 신청 또는 예정 세션이 있으면 전향 불가
  - 전향 후에는 멘토 활동만 가능

## 기술 스택

- Frontend: Next.js 16, React 19, Axios
- Backend: Java 21, Spring Boot, Spring Security, Spring Data JPA, JWT, JavaMail
- Database: MySQL 8
- Infra: Docker Compose, Nginx, AWS EC2

## 프로젝트 구조

```text
frontend/   Next.js 앱
backend/    Spring Boot API
infra/      Nginx 설정 및 운영용 리소스
```

## 로컬 실행

### 1. Docker로 전체 실행

루트 디렉터리에서 실행합니다.

```bash
docker compose up -d --build
```

접속 주소:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`
- Nginx Entry: `http://localhost`
- MySQL: `localhost:3306`

중지:

```bash
docker compose down
```

DB까지 초기화:

```bash
docker compose down -v
```

### 2. 개별 실행

백엔드:

```bash
cd backend
./gradlew bootRun
```

프론트엔드:

```bash
cd frontend
npm install
npm run dev
```

## 환경 변수

실제 비밀값은 `.env`에 두고 Git에는 올리지 않습니다.

주요 항목:

- `APP_DOMAIN`
- `APP_JWT_SECRET`
- `APP_EMAIL_DEBUG_FALLBACK`
- `APP_SWAGGER_ENABLED`
- `APP_MOCK_DATA_ENABLED`
- `APP_AUTH_REFRESH_TOKEN_SECURE`
- `MYSQL_DATABASE`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_APP_USERNAME`
- `MYSQL_APP_PASSWORD`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

운영에서는 특히 아래를 권장합니다.

- `APP_EMAIL_DEBUG_FALLBACK=false`
- `APP_SWAGGER_ENABLED=false`
- `APP_MOCK_DATA_ENABLED=false`
- `APP_AUTH_REFRESH_TOKEN_SECURE=true`

## 인증 구조

- 로그인 성공 시 Access Token과 Refresh Token을 발급합니다.
- Access Token은 API 인증에 사용합니다.
- Refresh Token은 세션 연장에 사용합니다.
- 비밀번호 재설정 시 기존 Refresh Token은 모두 무효화합니다.

## 역할 정책

- `MENTEE`: 멘토링 신청 가능
- `MENTOR`: 멘토 활동만 가능
- 멘토 계정은 멘토 상세 페이지를 통해 멘토링을 신청할 수 없습니다.
- 멘티는 멘토 프로필 생성 시 멘토로 전향할 수 있습니다.
- 단, `PENDING` 또는 `APPROVED` 신청이나 예정 세션이 남아 있으면 전향할 수 없습니다.

## 후기 정책

- 후기 작성은 완료된 세션에서만 가능합니다.
- 완료되지 않은 세션은 후기 작성이 불가능합니다.
- 완료된 세션이 10개를 넘으면 페이지네이션으로 조회합니다.

## 테스트/검증 상태

다음 항목을 기준으로 확인했습니다.

- `backend`: `./gradlew test`
- `frontend`: `npm run lint`
- `frontend`: `npm run build`

## 운영 배포 구조

컨테이너 구성:

- `nginx`
- `frontend`
- `backend`
- `mysql`

로컬 기본 compose는 개발/검증용이고, 운영은 `docker-compose.prod.yml` 오버라이드를 함께 사용합니다.

운영 목표:

- 외부 진입은 `nginx`만 공개
- `frontend`, `backend`, `mysql`은 내부 통신
- HTTPS 종료 지점은 `nginx`

운영 실행 예시:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## 운영 배포 체크리스트

### 배포 전 확인

- `main`이 배포 브랜치인지 확인
- 작업 트리가 clean 상태인지 확인
- 운영용 `.env` 준비
- 운영용 도메인 준비
- HTTPS 사용 시 인증서 준비

### 운영 환경값 체크

- `APP_DOMAIN`이 실제 도메인인지 확인
- `APP_JWT_SECRET`이 충분히 긴 랜덤 값인지 확인
- `APP_EMAIL_DEBUG_FALLBACK=false`
- `APP_SWAGGER_ENABLED=false`
- `APP_MOCK_DATA_ENABLED=false`
- `APP_AUTH_REFRESH_TOKEN_SECURE=true`

### Compose 체크

```bash
docker compose config
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
```

운영에서는 `80`, `443`만 외부 공개되도록 확인합니다.

### 스모크 테스트

공개 페이지:

- `/`
- `/mentors`
- `/login`
- `/signup`
- `/forgot-password`

인증:

- 이메일 인증 코드 발송
- 회원가입
- 로그인
- 로그아웃
- 비밀번호 재설정

멘티 흐름:

- 멘토 상세 진입
- 신청 버튼 노출
- 신청 생성
- 신청 목록 반영
- 세션 완료 후 후기 작성

멘토 흐름:

- 멘토 프로필 생성/수정
- 받은 신청 확인
- 승인/거절
- 세션 완료 처리
- 멘토 상세에서 신청 버튼 비노출
- `/mentors/:id/apply` 직접 접근 차단

전환 정책:

- 진행 중 신청/예정 세션이 있으면 멘토 전향 차단
- 정리 후 전향 가능

### 로그 확인

```bash
docker compose logs --tail 100 backend
docker compose logs --tail 100 frontend
docker compose logs --tail 100 nginx
docker compose logs --tail 100 mysql
```

## SMTP

Gmail SMTP 기준 예시:

- `MAIL_HOST=smtp.gmail.com`
- `MAIL_PORT=587`
- `MAIL_USERNAME=<gmail>`
- `MAIL_PASSWORD=<google app password>`

## 배포 메모

- EC2 소형 인스턴스에서는 서버에서 직접 이미지를 빌드하면 메모리/디스크 이슈가 발생할 수 있습니다.
- 이 경우 로컬에서 `linux/amd64` 이미지를 빌드해 서버에 업로드한 뒤 `--no-build`로 기동하는 방식이 더 안정적입니다.

## 라이선스

포트폴리오 용도로 제작된 프로젝트입니다.
