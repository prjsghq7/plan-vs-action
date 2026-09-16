# Plan vs Action 인증 구현 설명서 및 검증 증거

검증일: 2026-09-16  
검증 환경: Cloudflare Workers 로컬 개발 서버 + 로컬 D1  
민감정보 처리: 이메일, 세션 쿠키, 사용자·계획·할 일·태그 ID는 아래 증거에서 가림

## 1. 로그인과 서버 세션

- 로그인 성공 시 임의 세션 값을 발급하고 D1에는 SHA-256 해시만 저장한다.
- 브라우저 쿠키는 `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=1800` 속성을 사용한다.
- 자료 API는 요청의 `pva_session` 쿠키를 해시해 미폐기·미만료 세션과 사용자 계정을 함께 확인한다.
- URL, 사용자 지정 헤더, JSON 본문의 `userId`는 인증 근거로 사용하지 않는다.

가린 증거:

```http
GET /api/plans
Cookie: (없음)

HTTP/1.1 401 Unauthorized
{"error":"로그인이 필요합니다."}
```

## 2. 사용자별 자료 소유권

- 계획과 태그에는 `user_id`를 저장한다.
- 할 일, 실행 기록, 회고, 계획 이력, 상태 이력은 부모 계획까지 조인해 세션 사용자의 `user_id`를 검사한다.
- 단건 또는 특정 계획 범위 조회에서 타인의 ID를 사용하면 자료 존재 여부를 노출하지 않고 `404`를 반환한다.
- 목록, 집계, 근거 조회, 내보내기도 동일한 소유권 조건으로 제한한다.

양방향 교차 접근 결과:

```text
계정 A → 계정 B: tasks/history/actions/summary/evidence          404
계정 A → 계정 B: plan update/delete                              404
계정 A → 계정 B: task create/update/delete/status                 404
계정 A → 계정 B: action create/review create                      404
계정 B → 계정 A: 위와 같은 13개 요청                              모두 404
```

## 3. 태그 격리와 위조 입력 방어

- 태그 고유성은 공유 워크스페이스가 아니라 `(user_id, normalized_name)` 기준이다.
- 태그 생성·검색·할 일 연결 쿼리 모두 현재 사용자의 `user_id`를 포함한다.
- Zod 객체 스키마가 허용하지 않은 본문 필드를 제거하고, 서버는 소유자를 항상 세션에서 결정한다.

가린 증거:

```http
POST /api/plans?userId=[다른 사용자]
X-User-Id: [다른 사용자]
Cookie: pva_session=[가림]
Content-Type: application/json

{"title":"검증 계획","userId":"[다른 사용자]", ...}

HTTP/1.1 201 Created
내보내기 account.id: [현재 사용자]
다른 사용자 계획 포함: false
현재 사용자 소유 계획만 존재: true
```

```text
계정 A의 '공통태그' ID: [TAG-A]
계정 B의 '공통태그' ID: [TAG-B]
ID 분리: true
두 계정 할 일의 태그 연결 결과: 각각 ["공통태그"]
```

## 4. 기존 T06 자료 이전과 내보내기

- `0013_assign_legacy_data_to_current_user.sql`은 계정이 정확히 하나일 때만 기존 `user_id IS NULL` 계획·태그를 그 계정에 연결한다.
- `0014_rebuild_tags_for_user_ownership.sql`은 예전 `UNIQUE(workspace_id, name)` 제약을 제거하고 사용자별 태그 고유 인덱스를 만든다.
- 내보내기는 현재 사용자의 계정 공개 필드, 계획, 계획 이력, 할 일, 태그, 연결, 실행, 상태 이력, 회고만 포함하며 비밀번호·세션·인증번호는 포함하지 않는다.

로컬 D1 결과:

```text
미소유 계획: 0
미소유 태그: 0
현재 계정: 계획 8개, 태그 7개
PRAGMA foreign_key_check: 위반 0건
```

## 5. 로그아웃과 회원 탈퇴

- 로그아웃은 현재 세션을 즉시 폐기하고 쿠키를 만료시킨다.
- 회원 탈퇴는 상태 이력 → 실행 기록 → 태그 연결 → 회고 → 계획 이력 → 할 일 → 태그 → 계획 → 이메일 인증 → 세션 → 사용자 순서로 삭제한다.
- 계정 설정 화면에서 `탈퇴합니다` 문구 입력과 브라우저 확인을 모두 거쳐 탈퇴 API를 호출한다.

가린 증거:

```http
POST /api/auth/logout
Cookie: pva_session=[가림]

HTTP/1.1 200 OK

GET /api/plans
Cookie: pva_session=[같은 값 재사용]

HTTP/1.1 401 Unauthorized
```

```text
임시 계정 A 탈퇴: 200
임시 계정 B 탈퇴: 200
탈퇴 후 같은 세션 재사용: A=401, B=401
검증 후 임시 사용자: 0명
검증 후 임시 계획: 0개
```

## 6. 빌드·타입·API·마이그레이션 검증

- `npm run build`: TypeScript 프로젝트 빌드와 Vite Worker/클라이언트 빌드 통과
- `npm run lint`: 오류와 경고 없이 통과
- `npm run db:local`: 0013, 0014 로컬 D1 마이그레이션 적용 성공
- 정상 경로: 계획 생성·수정·삭제, 이력 조회, 할 일 목록·수정·삭제·완료, 실행 생성·목록, 회고 생성·목록, 집계, 근거, 내보내기 모두 200 또는 201
- 비로그인 자료 API: plans/tasks/tags/actions/reviews/summary/evidence/export 모두 401
- 교차 접근: A→B와 B→A의 읽기·수정·삭제·생성 시도 모두 404

정상 경로 상태 코드:

```text
plan create 201, plan update 200, plan history 200, plan delete 200
task list 200, task update 200, task status 200, task delete 200
action create 201, action list 200
review create 201, review list 200
summary 200, evidence 200, export 200, account delete 200
```

실제 서로 다른 날짜의 5일 기록과 3일차 전 규칙 변경은 사용자 활동 증거여야 하므로 테스트 데이터로 생성하지 않았다.
