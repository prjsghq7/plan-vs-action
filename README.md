# Plan vs Action

계획(Plan)을 세우고, 할 일(Task)을 실행한 기록(Action)과 회고(Review)를 남겨 **계획 대비 실제로 쓴 시간**을 비교하는 다이어리 웹 앱입니다. Cloudflare Workers 한 곳에서 화면과 API를 함께 제공하고, 데이터는 Cloudflare D1에 계정별로 나눠 저장합니다.

- 사이트: https://plan-vs-action.prjsghq7.workers.dev/ (이메일 가입 후 사용)
- 포트폴리오: https://prjsghq7.github.io/ (AI 활용 › Plan vs Action)

## 주요 기능

| 화면 | 내용 |
|---|---|
| 대시보드 | 계획 대비 실제 시간 집계와 근거가 된 기록 목록 |
| 계획 · 할 일 | 계획 작성, 할 일 추가 · 우선순위 · 태그, 계획별 변경 이력 |
| 오늘 · 실행 | 오늘 할 일과 실제 작업 시간 기록 (작업 기록이 있어야 완료 처리) |
| 회고 | 계획별 회고 작성 |
| 계정 | 프로필 · 비밀번호 변경, 회원 탈퇴, 내 기록 JSON 내보내기 |

## 인증과 데이터 보호

- **이메일 인증 가입:** 메일로 받은 인증을 거쳐야 가입이 완료되고, 비밀번호 재설정도 같은 방식으로 처리합니다.
- **세션:** 세션 값은 HttpOnly 쿠키로만 전달하고, DB에는 SHA-256 해시로만 저장합니다.
- **계정별 데이터 분리:** 모든 기록은 소유자 기준으로 조회 · 수정하고, 다른 계정의 자료를 요청하면 존재 여부도 드러나지 않게 404로 응답합니다. 두 계정이 서로의 자료에 접근하는 경우를 양방향으로 검증했습니다.
- **입력 검증:** API 요청 본문은 Zod 스키마로 검증합니다.
- **내보내기:** 내부 ID와 관리용 필드를 빼고, 화면에 보이는 사용자 기록만 JSON으로 내려 줍니다.

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 화면 | React 19 · TypeScript · Vite |
| API | Hono (Cloudflare Workers) · Zod |
| DB | Cloudflare D1 (SQLite) · 마이그레이션 16단계 |
| 배포 | Wrangler |

## 실행 방법

### 1. 환경 변수

프로젝트 루트에 `.dev.vars`를 만들고 아래 값을 채웁니다. 이 파일은 `.gitignore`에 포함되어 있으니 커밋하지 않습니다.

```ini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-address@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=your-address@gmail.com
AUTH_SECRET=임의의-64자-문자열
```

`AUTH_SECRET`은 다음 명령으로 만들 수 있습니다.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. 로컬 DB와 개발 서버

```bash
npm install
npm run db:local     # 로컬 D1에 마이그레이션 적용
npm run dev
```

| 명령 | 설명 |
|---|---|
| `npm run check` | ESLint 검사 + 타입 검사 + 빌드 |
| `npm run db:remote` | 운영 D1에 마이그레이션 적용 |
| `npm run deploy` | 빌드 후 Cloudflare Workers에 배포 |

## 구조

```text
src/
├─ pages/        대시보드 · 계획 · 오늘 · 실행 · 회고 · 계정 · 인증 화면
├─ components/   공용 컴포넌트 (태그 · 우선순위 선택 등)
└─ lib/          API 호출 · 라우터 · 입력 검증 · 타입
worker/
├─ index.ts      API 라우트 (계획 · 할 일 · 실행 · 회고 · 집계 · 내보내기)
└─ auth.ts       가입 · 로그인 · 세션 · 비밀번호 재설정
migrations/      D1 스키마 변경 이력 (0001 ~ 0016)
wrangler.jsonc   Workers · D1 설정
```

## 만든 방식

K-뉴딜 SKT ALEPH 과정의 AI 활용 과제입니다. 화면 · API · 인증 구현은 AI에게 맡기고, Plan · Task · Action · Review 데이터 구조, 작업 기록이 있어야 완료되는 규칙, 계정별 데이터 범위, 운영 DB 마이그레이션 범위, 내보내기에서 뺄 항목은 직접 정했습니다.
