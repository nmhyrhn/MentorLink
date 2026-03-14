# Deploy Checklist

## Before Deploy

- `main` is the release branch
- local working tree is clean
- `main` and `dev` point to the intended release commit
- required production `.env` values are prepared
- `infra/certs/fullchain.pem` is ready
- `infra/certs/privkey.pem` is ready

## Config Checks

- `APP_DOMAIN` is the real production domain
- `APP_JWT_SECRET` is a strong random secret
- `APP_EMAIL_DEBUG_FALLBACK=false`
- `APP_SWAGGER_ENABLED=false`
- `APP_MOCK_DATA_ENABLED=false`
- `APP_AUTH_REFRESH_TOKEN_SECURE=true`
- MySQL passwords are not local development values
- Gmail SMTP app password is valid

## Compose Checks

- `docker compose config` works for local
- `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` works for production
- production merge exposes only `80` and `443`
- production merge does not expose `3000`, `8080`, or `3306`
- nginx uses `default.prod.conf.template`

## Build Checks

- `backend`: `./gradlew test`
- `frontend`: `npm run lint`
- `frontend`: `npm run build`

## Start Production Stack

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Smoke Test

### Public Pages

- `/`
- `/mentors`
- `/login`
- `/signup`
- `/forgot-password`

### Auth

- email verification code request
- signup
- login
- logout
- password reset request
- password reset confirm
- login with new password

### Mentee Flow

- mentor detail page loads
- mentoring apply button visible for mentee
- application can be submitted
- sent applications list updates
- scheduled session appears after approval
- completed session moves to completed section
- review can be written only in completed section

### Mentor Flow

- mentor profile create or update works
- pending applications list loads
- approve works
- reject works
- session complete works
- mentor detail page does not show apply button for mentor
- direct access to `/mentors/:id/apply` is blocked for mentor

### Role Transition Policy

- mentee with `PENDING` or `APPROVED` application cannot become mentor
- mentee with only completed/rejected/cancelled history can become mentor
- after mentor conversion, mentoring apply UI disappears

### Data Checks

- signup creates `users`
- application creates `applications`
- approval creates `mentoring_sessions`
- review creates `reviews`
- password reset updates login credentials

## Log Checks

- `docker compose logs backend --tail 100`
- `docker compose logs frontend --tail 100`
- `docker compose logs nginx --tail 100`
- `docker compose logs mysql --tail 100`

Confirm there are no:

- boot failures
- datasource auth errors
- SMTP auth failures
- repeated 4xx/5xx bursts

## Final Go/No-Go

Go if all are true:

- smoke tests passed
- production compose exposes only nginx
- cert files are mounted correctly
- no critical log errors remain
- database backup or rollback plan exists
