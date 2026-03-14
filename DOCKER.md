# MentorLink Docker Guide

## Overview

MentorLink runs with four containers.

- `frontend`: Next.js 16 app
- `backend`: Spring Boot API with `/api` context path
- `mysql`: MySQL 8 database
- `nginx`: reverse proxy for frontend and backend

## Local Compose

Use local compose when developing or doing final local verification.

```bash
docker compose up -d --build
```

Published ports in local mode:

- `http://localhost:3000` -> frontend
- `http://localhost:8080/api` -> backend
- `http://localhost` -> nginx
- `localhost:3306` -> MySQL

Stop local containers:

```bash
docker compose down
```

Reset local MySQL volume:

```bash
docker compose down -v
```

## Production Compose

Production uses the base compose file plus `docker-compose.prod.yml`.

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Production design goals:

- external traffic goes through `nginx` only
- `frontend`, `backend`, `mysql` are not published to the host
- HTTPS is terminated at `nginx`
- Swagger and mock data stay disabled
- refresh token cookie uses `Secure`

Published ports in production mode:

- `80`
- `443`

## Required Environment Variables

Copy `.env.example` and fill real values for production.

Core app:

- `APP_DOMAIN`
- `APP_JWT_SECRET`
- `APP_EMAIL_DEBUG_FALLBACK=false`
- `APP_SWAGGER_ENABLED=false`
- `APP_MOCK_DATA_ENABLED=false`
- `APP_AUTH_REFRESH_TOKEN_SECURE=true`

Database:

- `MYSQL_DATABASE`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_APP_USERNAME`
- `MYSQL_APP_PASSWORD`

Mail:

- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_SMTP_AUTH`
- `MAIL_SMTP_STARTTLS_ENABLE`
- `MAIL_SMTP_STARTTLS_REQUIRED`
- `MAIL_SMTP_SSL_TRUST`
- `MAIL_SMTP_SSL_PROTOCOLS`
- `MAIL_SMTP_CONNECTION_TIMEOUT`
- `MAIL_SMTP_TIMEOUT`
- `MAIL_SMTP_WRITE_TIMEOUT`
- `MAIL_DEBUG=false`
- `MAIL_LOG_LEVEL=INFO`

## TLS Certificates

Production nginx expects certificate files in `infra/certs`.

Required files:

- `infra/certs/fullchain.pem`
- `infra/certs/privkey.pem`

The directory is tracked with `.gitkeep`, but real certificates must be provided separately and must not be committed.

## Nginx Routing

Local nginx config:

- `/` -> frontend
- `/api/` -> backend

Production nginx template:

- redirects `http` to `https`
- serves frontend on `/`
- proxies backend on `/api/`

## Recommended Deployment Order

1. Prepare production `.env`
2. Place TLS certificates in `infra/certs`
3. Verify compose merge output
4. Build and start production containers
5. Run smoke tests
6. Confirm logs are clean

Compose merge check:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
```

## Useful Commands

View running containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f nginx
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

Restart services:

```bash
docker compose restart nginx backend frontend
```

Production restart:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
