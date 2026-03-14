# MentorLink Deploy Notes

## 구성

- `nginx`
- `frontend`
- `backend`
- `mysql`

## 로컬 실행

```bash
docker compose up -d --build
```

## 운영 실행

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## 운영 체크 포인트

- 외부 공개는 `nginx`만 담당
- `frontend`, `backend`, `mysql`은 내부 통신 유지
- `APP_SWAGGER_ENABLED=false`
- `APP_MOCK_DATA_ENABLED=false`
- `APP_EMAIL_DEBUG_FALLBACK=false`
- HTTPS 사용 시 `APP_AUTH_REFRESH_TOKEN_SECURE=true`

## 필요한 운영값

- `APP_DOMAIN`
- `APP_JWT_SECRET`
- `MYSQL_*`
- `MAIL_*`

## HTTPS 준비물

- 도메인
- DNS `A` 레코드
- 인증서
  - `infra/certs/fullchain.pem`
  - `infra/certs/privkey.pem`

## 배포 시 실제로 겪은 이슈

- EC2 소형 인스턴스에서 서버 빌드 시 메모리 부족
- 디스크 부족으로 Docker 아카이브 정리 필요
- 로컬 ARM 이미지와 EC2 AMD64 아키텍처 mismatch

## 운영 팁

- 작은 EC2에서는 서버에서 직접 빌드하기보다 로컬에서 `linux/amd64` 이미지를 빌드해 업로드하는 편이 안정적
- 배포 후에는 `docker compose ps`, `docker compose logs`로 상태 확인
