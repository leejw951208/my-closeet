<!-- auth-login 슬러그의 단계·태스크·아키텍처·테스트 매트릭스. -->

# Plan. 사용자 로그인 (Auth Login)

## 단계 구성

| Phase | 이름                        | 목표                                                                                                              |
| ----- | --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| P1    | 백엔드 JWT 검증 가드        | NestJS 글로벌 AuthGuard + @Public + @CurrentUser 가 동작하고, 보호 라우트가 401/200으로 정확히 분기된다.          |
| P2    | 백엔드 사용자 동기화        | `POST /auth/sync` 가 신규/기존 사용자 모두에 대해 User + Closet 을 idempotent 하게 보장한다.                      |
| P3    | 모바일 Supabase SDK 통합     | supabase_flutter 초기화 + AuthController·SecureTokenStorage 실연결. 카카오·애플·이메일 흐름이 단말에서 동작한다. |
| P4    | 모바일 로그인 화면 + 결선    | `/login` UI(약관·14세·3-provider 버튼) 완성, redirect 결선 갱신, e2e 시나리오 수동 검증.                          |

## 구현 태스크

### P1. 백엔드 JWT 검증 가드

- [ ] **T001** `apps/api/src/auth/` 모듈 디렉토리 생성 (`auth.module.ts`, `auth.service.ts`, `jwks.service.ts`, `auth.guard.ts`, `current-user.decorator.ts`, `public.decorator.ts`)
    - 선행. 없음 · 예상. 0.5h
- [ ] **T002** `JwksService` — Supabase JWKS URL 조회 + 5분 TTL 캐시. `jose` 또는 `jwks-rsa` 사용
    - 선행. T001 · 예상. 1h
- [ ] **T003** `AuthService.verify(token)` — 서명·만료·issuer·audience 검증, 시계 스큐 60초
    - 선행. T002 · 예상. 1h
- [ ] **T004** `AuthGuard` (CanActivate) — `Authorization` 헤더 파싱, `@Public()` 우회, 실패 시 401 `{ code, message }`
    - 선행. T003 · 예상. 1h
- [ ] **T005** `@CurrentUser()` ParamDecorator — `req.user` 반환
    - 선행. T004 · 예상. 0.5h
- [ ] **T006** `app.module.ts` 에 `APP_GUARD` 글로벌 등록 + `AuthController` placeholder(`/auth/me`) 로 200/401 확인 라우트
    - 선행. T005 · 예상. 0.5h
- [ ] **T007** 단위 테스트 — `AuthService.verify` (성공/만료/서명실패/issuer불일치)
    - 선행. T003 · 예상. 1h
- [ ] **T008** e2e 테스트 — 토큰 없이/유효 토큰/만료 토큰으로 `/auth/me` 호출
    - 선행. T006 · 예상. 1h

### P2. 백엔드 사용자 동기화

- [ ] **T009** Prisma `User.id` 가 Supabase UUID(`sub`)와 호환되는지 확인(@db.Uuid). 필요 시 마이그레이션 노트만 작성
    - 선행. T001 · 예상. 0.5h
- [ ] **T010** `UsersService.syncFromJwt(jwtPayload)` — `prisma.$transaction` 으로 `user.upsert` + `closet.upsert(where: { userId })`
    - 선행. T009 · 예상. 1.5h
- [ ] **T011** `AuthController.POST /auth/sync` — `@CurrentUser()` 로 받은 페이로드 → service 호출 → `{ user: { id, email, provider, closetId } }` 반환
    - 선행. T010, T006 · 예상. 0.5h
- [ ] **T012** `AuthProvider` enum 매핑 (Supabase `app_metadata.provider` 의 `kakao`/`apple`/`email` 문자열 → Prisma enum)
    - 선행. T010 · 예상. 0.5h
- [ ] **T013** e2e 테스트 — 신규 사용자 1회 / 동일 사용자 2회 호출 / 메일 변경 후 호출 / provider 변경 시 동작
    - 선행. T011 · 예상. 1h

### P3. 모바일 Supabase SDK 통합

- [ ] **T014** `pubspec.yaml` 에 `supabase_flutter`, `app_links`(딥링크) 추가
    - 선행. 없음 · 예상. 0.5h
- [ ] **T015** iOS `Info.plist` URL Scheme + Universal Link Associated Domain 등록. Android `AndroidManifest.xml` intent-filter 추가
    - 선행. T014 · 예상. 1h
- [ ] **T016** `main.dart` 에서 `Supabase.initialize(url, anonKey, authFlowType: pkce)` 호출
    - 선행. T014 · 예상. 0.5h
- [ ] **T017** `FlutterSecureTokenStorage` 실제 사용 — Supabase `onAuthStateChange` 구독해 토큰 변경 시 storage 저장/삭제
    - 선행. T016 · 예상. 1h
- [ ] **T018** `AuthController.refreshToken()` 구현 — Supabase `refreshSession()` 호출 → 새 access token 반환 + signIn 갱신
    - 선행. T017 · 예상. 1h
- [ ] **T019** 앱 부팅 시 storage 에서 세션 복구 (`Supabase.instance.client.auth.recoverSession`)
    - 선행. T017 · 예상. 0.5h

### P4. 모바일 로그인 화면 + 결선

- [ ] **T020** `features/auth/presentation/login_screen.dart` — 약관·14세 체크박스, 카카오·애플·이메일 버튼 3개
    - 선행. T016 · 예상. 1.5h
- [ ] **T021** 카카오 로그인 핸들러 — `signInWithOAuth(Provider.kakao, redirectTo: ...)` + 딥링크 콜백 처리
    - 선행. T020, T015 · 예상. 1h
- [ ] **T022** 애플 로그인 핸들러 — iOS 네이티브 흐름, Android는 웹 OAuth
    - 선행. T020, T015 · 예상. 1h
- [ ] **T023** 이메일 매직링크 — 이메일 입력 + `signInWithOtp(email)` + "메일을 확인하세요" 상태 화면
    - 선행. T020 · 예상. 1h
- [ ] **T024** 로그인 성공 직후 `POST /auth/sync` 호출 → 결과로 받은 closetId 를 AuthController 에 저장(또는 별도 ProfileProvider)
    - 선행. T011, T018 · 예상. 1h
- [ ] **T025** 로그아웃 — 설정 화면 임시 버튼에서 `Supabase.signOut()` + storage clear + `AuthController.signOut()`
    - 선행. T017 · 예상. 0.5h
- [ ] **T026** `app/router.dart` redirect 갱신 — `AuthStatus.unknown` 동안 스플래시 표시(세션 복구 대기)
    - 선행. T019 · 예상. 0.5h
- [ ] **T027** 위젯 테스트 — 약관 미동의 시 버튼 비활성, 동의 후 활성
    - 선행. T020 · 예상. 0.5h
- [ ] **T028** 통합 시나리오 수동 점검 — 실제 카카오/애플/이메일 1회씩 dev 빌드에서 진행, 토큰 만료 후 갱신, 재부팅 후 세션 복구
    - 선행. 전체 · 예상. 2h
- [ ] **T029** `flutter analyze` / `flutter test` / `pnpm --filter api test` 통과 확인
    - 선행. 전체 · 예상. 0.5h

## 아키텍처 다이어그램

```
모바일 (Flutter)                           Supabase Auth (Seoul)
─────────────────                           ─────────────────────
LoginScreen
  ├─ [카카오] ─▶ signInWithOAuth(kakao) ──▶ Kakao OAuth ─▶ callback
  ├─ [애플]  ─▶ signInWithOAuth(apple) ──▶ Apple OAuth ─▶ callback
  └─ [이메일] ─▶ signInWithOtp(email) ────▶ 매직링크 메일

                       ▲
                       │ onAuthStateChange (Session)
                       ▼
            ┌─────────────────────────────┐
            │ AuthController (Riverpod)   │
            │  + SecureTokenStorage write │
            └──────────┬──────────────────┘
                       │ accessToken
                       ▼
            ┌─────────────────────────────┐
            │ Dio + AuthInterceptor       │
            │  Authorization: Bearer ...  │
            └──────────┬──────────────────┘
                       │
                       ▼
NestJS (Fly.io)                            Supabase JWKS
─────────────                              ──────────────
AuthGuard
  ├─ @Public 체크
  ├─ JWT 추출 ──▶ AuthService.verify ──▶ JwksService (5min cache) ──▶ JWKS
  └─ req.user = { id, email, provider }
                       │
                       ▼
보호 컨트롤러 (@CurrentUser)
  └─ POST /auth/sync ─▶ UsersService.syncFromJwt
                          └─ prisma.$transaction
                               ├─ user.upsert
                               └─ closet.upsert (userId unique)
```

## 테스트 매트릭스

| #   | 케이스                                                | 입력                                           | 기대 결과                                                                  |
| --- | ----------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | 카카오 신규 로그인                                    | 동의 체크 + 카카오 버튼                        | OAuth 완료 → AuthStatus.signedIn → /auth/sync 200 → 홈 진입                |
| 2   | 애플 신규 로그인                                      | 동의 체크 + 애플 버튼                          | OAuth 완료 → User+Closet 생성 → 홈                                         |
| 3   | 이메일 매직링크                                       | 이메일 입력 + 전송 → 메일 클릭                 | 딥링크로 앱 복귀 → signedIn → /auth/sync 200                               |
| 4   | 약관/14세 미동의                                      | 동의 미체크                                    | 3개 버튼 모두 비활성                                                       |
| 5   | OAuth 동의 취소                                       | 카카오 화면에서 취소                           | "로그인 취소" 메시지, signedOut 유지                                       |
| 6   | 만료 JWT로 보호 호출                                  | 보호 라우트 + 만료 토큰                        | 백엔드 401 → 모바일 refreshToken 1회 → 성공 시 재요청, 실패 시 signedOut    |
| 7   | 토큰 없이 보호 호출                                   | `GET /auth/me` (Authorization 없음)            | 401 `{ code: 'unauthorized' }`                                             |
| 8   | 화이트리스트 라우트                                   | `GET /health` (Authorization 없음)            | 200                                                                        |
| 9   | 서명 위조 JWT                                         | 임의 서명된 토큰                               | 401, AuthService.verify 실패                                               |
| 10  | issuer 불일치 JWT                                     | 다른 Supabase 프로젝트 토큰                    | 401                                                                        |
| 11  | sync 중복 호출 (idempotent)                           | 동일 사용자로 `POST /auth/sync` 2회            | 두 번 모두 200, User·Closet 단일 행 유지                                   |
| 12  | sync 시 메일 변경                                     | 기존 user + 다른 email JWT                     | User.email 갱신, Closet 변경 없음                                          |
| 13  | 앱 재부팅 후 세션 복구                                | dev 빌드 종료/재실행                           | 스플래시 → 자동 signedIn → 홈                                              |
| 14  | 로그아웃                                              | 설정 → 로그아웃 버튼                           | storage clear + signedOut + /login 리다이렉트                              |
| 15  | JWKS 조회 실패 + 캐시 hit                             | Supabase JWKS 일시 장애                        | 캐시 키로 검증 계속 (5분 내)                                               |
| 16  | JWKS 조회 실패 + 캐시 miss                            | 부팅 직후 JWKS 장애                            | 503, Sentry 캡처                                                           |
| 17  | `flutter analyze` / `flutter test` / `api test` 통과 | CI 환경                                        | 0 issue, 단위·e2e 전부 통과                                                |
