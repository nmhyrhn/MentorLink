# MentorLink

MentorLink는 멘티가 멘토에게 멘토링을 신청하고, 멘토가 승인하면 세션이 생성되며, 세션 종료 후 리뷰를 남기는 매칭형 서비스입니다. 채용 플랫폼의 `지원 -> 승인 -> 인터뷰 -> 평가` 흐름과 유사한 구조를 `신청 -> 승인 -> 세션 -> 리뷰`로 풀어낸 백엔드 포트폴리오 프로젝트입니다.

## 기술 스택

- Backend: Java 21, Spring Boot, Spring Data JPA, Spring Security, JWT, MySQL
- Frontend: Next.js
- Infra: Docker, Nginx, AWS EC2 배포 전개 가능 구조
- Dev: Swagger(OpenAPI), GitHub

## 실행 주소

- Frontend: `http://localhost`
- API: `http://localhost/api`
- Swagger UI: `http://localhost/api/swagger-ui.html`
- MySQL: `localhost:3306`

## Docker로 전체 실행

루트 디렉터리에서 실행합니다.

```bash
docker compose up --build
```

백그라운드 실행:

```bash
docker compose up --build -d
```

중지:

```bash
docker compose down
```

## 개별 실행

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

## SMTP 설정

루트의 `.env` 파일에 Gmail SMTP 설정을 넣어두었습니다. `.env`는 `.gitignore`에 포함되어 GitHub에 올라가지 않습니다.

예시 파일은 [`.env.example`](D:\1. 남혜린\2. 공부\코딩\MentorLink\.env.example)에서 확인할 수 있습니다.

필수 값:

- `MAIL_HOST=smtp.gmail.com`
- `MAIL_PORT=587`
- `MAIL_USERNAME=사용할 Gmail 주소`
- `MAIL_PASSWORD=Google 앱 비밀번호`

현재 코드 기준으로 이메일 인증 API는 준비되어 있지만, 구글 SMTP에서 `Username and Password not accepted`가 반환되어 실제 메일 발송은 아직 막혀 있습니다. 새 앱 비밀번호를 다시 발급하거나 Gmail 보안 설정을 확인한 뒤 재검증하면 됩니다.

## 로그인용 목업 계정

공통 비밀번호:

- `password1234`

멘티 계정:

- `mentee.demo@mentorlink.dev` / 오하린
- `mentee.second@mentorlink.dev` / 김서진
- `mentee.third@mentorlink.dev` / 박도윤

멘토 계정:

- `backend.junior@mentorlink.dev` / 김민서 / 백엔드 개발 / 2년
- `backend.senior@mentorlink.dev` / 이도현 / 백엔드 아키텍처 / 11년
- `frontend.react@mentorlink.dev` / 박지윤 / 프론트엔드 개발 / 5년
- `devops.aws@mentorlink.dev` / 최현우 / DevOps / AWS / 8년
- `product.design@mentorlink.dev` / 정수빈 / 프로덕트 디자인 / 6년
- `ux.design@mentorlink.dev` / 서예린 / UX 리서치 / 4년
- `data.engineer@mentorlink.dev` / 윤다정 / 데이터 엔지니어링 / 7년
- `android.mobile@mentorlink.dev` / 강서준 / 안드로이드 개발 / 5년
- `ios.mobile@mentorlink.dev` / 한소율 / iOS 개발 / 9년
- `qa.automation@mentorlink.dev` / 임태경 / QA 자동화 / 10년

참고:

- 현재 DB 볼륨이 유지되고 있어서 예전에 생성된 테스트 계정 몇 개가 함께 남아 있습니다.
- 완전히 새 데이터로 시작하려면 `docker compose down -v` 후 다시 실행해야 합니다. 이 명령은 기존 DB 데이터를 삭제합니다.

## 운영 흐름 목업 데이터

시드 데이터는 실제 운영 화면을 확인할 수 있도록 상태별로 나뉘어 있습니다.

- `PENDING` 신청 3건
- `APPROVED` 신청 3건
- `COMPLETED` 신청 2건
- `REJECTED` 신청 1건
- `SCHEDULED` 세션 3건
- `FINISHED` 세션 2건
- 완료된 세션에 대한 리뷰 2건

예시 흐름:

1. 멘티가 멘토를 조회한다.
2. 멘토링을 신청하면 `applications`에 `PENDING` 상태로 저장된다.
3. 멘토가 승인하면 `Application` 상태가 `APPROVED`로 바뀌고 `sessions`에 세션이 생성된다.
4. 세션 완료 시 `sessions` 상태가 `FINISHED`가 된다.
5. 리뷰 작성 시 `reviews`에 평점과 코멘트가 저장된다.

## 데이터베이스 구조

MySQL 데이터베이스 이름은 `mentorlink`입니다.

주요 테이블:

- `users`
- `mentor_profiles`
- `applications`
- `sessions`
- `reviews`
- `email_verifications`

핵심 관계:

- 멘토 1 : N 신청
- 멘티 1 : N 신청
- 신청 1 : 1 세션
- 세션 1 : 1 리뷰

## 확인된 상태

- `backend`: `./gradlew compileJava` 성공
- `frontend`: `npm run build` 성공
- `docker compose up --build -d` 성공
- `http://localhost` 응답 확인
- `http://localhost/api/mentors` 응답 확인
- `http://localhost/api/swagger-ui.html` 응답 확인

## 포트폴리오 문서

기획서는 [portfolio-plan.md](D:\1. 남혜린\2. 공부\코딩\MentorLink\docs\portfolio-plan.md)에 정리되어 있습니다.
