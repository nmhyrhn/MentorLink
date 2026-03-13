# MentorLink 배포 준비 문서

## 반영 완료 항목

- `APP_JWT_SECRET` 기본 하드코딩 제거
- `APP_EMAIL_DEBUG_FALLBACK=false` 기본 적용
- `MAIL_DEBUG=false` 기본 적용
- Swagger 기본 비공개 처리
- 목업 데이터 초기화 기본 비활성화
- MySQL 앱 계정 분리
- HTTPS용 Nginx 운영 템플릿 추가

## 운영용 파일

- 로컬 개발용 환경 변수: `.env`
- 운영용 예시 환경 변수: `.env.production.example`
- 로컬/기본 Compose: `docker-compose.yml`
- 운영용 Compose 오버라이드: `docker-compose.prod.yml`
- 운영용 HTTPS Nginx 템플릿: `infra/nginx/default.prod.conf.template`

## 실제 배포 전 해야 할 값 교체

### 1. 운영용 환경 변수 파일 준비

`.env.production.example`를 복사해 `.env.production`으로 만들고 아래 값을 실제 운영값으로 교체합니다.

- `APP_DOMAIN`
- `APP_JWT_SECRET`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_APP_PASSWORD`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

### 2. 인증서 파일 준비

아래 경로에 인증서를 배치합니다.

- `infra/certs/fullchain.pem`
- `infra/certs/privkey.pem`

### 3. 운영 실행 명령

```bash
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

## 주의 사항

- 기존 로컬 MySQL 볼륨은 `root` 계정 기준으로 만들어져 있을 수 있습니다.
- 새 앱 계정(`MYSQL_APP_USERNAME`)을 반영하려면 신규 배포 환경에서 시작하거나, 로컬에서는 한 번 DB 볼륨을 초기화해야 할 수 있습니다.
- 운영에서는 `APP_AUTH_REFRESH_TOKEN_SECURE=true`를 유지해야 합니다.
- Swagger는 기본 비공개이며, 운영에서는 다시 열지 않는 것을 권장합니다.
