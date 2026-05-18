<!-- 사용자 로그인 구현 계획. SMS OTP + PIN + 생체인식 백엔드·모바일 태스크 분해. -->

# Plan. 사용자 로그인 (SMS + PIN + 생체인식)

## 단계 구성

| Phase | 이름                        | 목표                                                                                     |
| ----- | --------------------------- | ---------------------------------------------------------------------------------------- |
| P0    | 기존 Supabase Auth 제거     | 폐기된 OAuth 코드·의존성·환경변수·DB 컬럼을 정리해 새 인증 시스템이 깨끗한 바닥에서 시작 |
| P1    | 백엔드 OTP 기반             | 솔라피 연동, OTP 발송·검증, rate limit. SMS가 사용자에게 도달하고 코드를 검증할 수 있음  |
| P2    | 백엔드 인증·계정            | User·RefreshToken 스키마, PIN 해시·검증, JWT 발급·회전. API 만으로 가입·로그인 가능      |
| P3    | 모바일 가입·로그인 UI       | 번호 입력 → OTP → PIN 설정 → 홈, 생체인식 등록 화면. 신규 사용자가 가입해 진입 가능      |
| P4    | 모바일 PIN·생체인식 로그인  | 재방문 시 생체인식·PIN 입력으로 1초 진입. 잠금·재설정 UX 완비                            |
| P5    | 번호 변경·간접 신호·로그아웃 | 설정 화면의 번호 변경, 30일 배너, PIN 3회 실패 안내, 로그아웃                            |
| P6    | 통합 검증·문서화            | 단위·통합 테스트, 실기기 수동 e2e, 운영 런북 작성                                        |
| P7    | 보안·운영 보강 (1라운드)    | verify 결과의 critical/high/medium 결함 처리. lookupKey·throttler·HMAC·세션 1회용·HSTS·생체 가드·잠금 UI·30일 배너. |

## 구현 태스크

### P0. 기존 Supabase Auth 제거

- [ ] **T001** `apps/api/src/auth/` 의 Supabase JWKS·JWT 검증 모듈·테스트 삭제
    - 선행. 없음 · 예상. 0.5h
- [ ] **T002** `apps/api/src/users/syncFromAuth` 등 Supabase sub 기반 동기화 로직 제거, User 모델은 유지(스키마는 P2에서 마이그레이션)
    - 선행. T001 · 예상. 0.5h
- [ ] **T003** `apps/api/package.json` 에서 `jose`, `@supabase/*` 의존성 제거, `pnpm install`
    - 선행. T002 · 예상. 0.2h
- [ ] **T004** `apps/api/.env.example` 에서 `SUPABASE_*` 항목 제거, 신규 항목(`SOLAPI_API_KEY`, `SOLAPI_API_SECRET`, `SOLAPI_SENDER`, `JWT_SECRET`, `JWT_ACCESS_TTL_MIN`, `JWT_REFRESH_TTL_DAYS`) 추가
    - 선행. T003 · 예상. 0.3h
- [ ] **T005** `apps/mobile/lib/features/auth/` 의 Supabase 로그인 화면·핸들러·`SupabaseAuthController` 삭제, `auth_state.dart` 의 골격(AuthStatus enum 등)은 유지
    - 선행. 없음 · 예상. 0.5h
- [ ] **T006** `apps/mobile/pubspec.yaml` 에서 `supabase_flutter`, `app_links` 제거, `local_auth`, `flutter_secure_storage` 잔존 확인, `flutter pub get`
    - 선행. T005 · 예상. 0.3h
- [ ] **T007** `apps/mobile/lib/main.dart`, `core/env/app_env.dart` 에서 Supabase 초기화·환경변수 제거
    - 선행. T006 · 예상. 0.3h
- [ ] **T008** `apps/mobile/android/app/src/main/AndroidManifest.xml`, `ios/Runner/Info.plist` 에서 OAuth 콜백용 intent-filter·URL Scheme 제거
    - 선행. T007 · 예상. 0.2h

### P1. 백엔드 OTP 기반

- [ ] **T101** Prisma 스키마에 `OtpRequest` 모델 추가 (`id`, `phoneNumber`, `codeHash`, `purpose Enum`, `createdAt`, `expiresAt`, `consumedAt`), `prisma migrate dev`
    - 선행. T004 · 예상. 0.5h
- [ ] **T102** `apps/api/src/sms/solapi.service.ts` — 솔라피 SDK(`solapi`) 연동, `sendOtp(phoneNumber, code)` 메서드, 실패 시 502 throw + Sentry
    - 선행. T101 · 예상. 1h
- [ ] **T103** `apps/api/src/auth/otp/otp.service.ts` — `requestOtp(phoneNumber, purpose)`, 6자리 코드 생성, bcrypt 해시 저장, 5분 TTL, 1분 쿨다운·1시간 5회 리밋
    - 선행. T102 · 예상. 1.5h
- [ ] **T104** `OtpService.verifyOtp(requestId, code, purpose)` — 만료·중복 사용 검사, 검증 성공 시 5분 짜리 `otpSessionToken` (별도 짧은 JWT) 발급
    - 선행. T103 · 예상. 1h
- [ ] **T105** `POST /auth/otp/send`, `POST /auth/otp/verify` 컨트롤러 + DTO + class-validator
    - 선행. T104 · 예상. 0.5h
- [ ] **T106** OtpService 단위 테스트 — 정상·쿨다운·리밋·만료·코드 불일치 (6건)
    - 선행. T104 · 예상. 1.5h
- [ ] **T107** SolapiService mock 단위 테스트 — 실패 시 502 변환 (2건)
    - 선행. T102 · 예상. 0.5h

### P2. 백엔드 인증·계정

- [ ] **T201** Prisma `User` 스키마 수정 — `phoneNumber String @unique`, `pinHash String`, `pinFailedCount Int @default(0)`, `pinLockedUntil DateTime?`, `lastSignInAt DateTime?` 추가, 기존 OAuth 컬럼 제거, migrate
    - 선행. T004 · 예상. 0.5h
- [ ] **T202** Prisma `RefreshToken`, `PhoneChangeLog`, `PinResetLog` 모델 추가 + migrate
    - 선행. T201 · 예상. 0.5h
- [ ] **T203** `apps/api/src/auth/jwt/jwt.service.ts` — `issuePair(userId, deviceId)` (access 30분 + refresh 30일), refresh token은 bcrypt 해시로 DB 저장, 회전 로직
    - 선행. T202 · 예상. 1.5h
- [ ] **T204** `apps/api/src/auth/pin/pin.service.ts` — `setPin(userId, pin)` (bcrypt cost 12, 단순 패턴 거부), `verifyPin(userId, pin)` (실패 카운트, 5회 시 10분 잠금)
    - 선행. T202 · 예상. 1.5h
- [ ] **T205** `apps/api/src/auth/auth.service.ts` — `signupComplete(otpSessionToken, pin)` (User + Closet upsert in transaction), `pinLogin`, `pinReset`, `phoneChange`, `logout`
    - 선행. T203, T204 · 예상. 2h
- [ ] **T206** `POST /auth/signup/complete`, `/auth/pin/verify`, `/auth/pin/reset`, `/auth/refresh`, `/auth/phone/change`, `/auth/logout`, `GET /auth/me` 컨트롤러 + DTO
    - 선행. T205 · 예상. 1h
- [ ] **T207** `AuthGuard` — Bearer access token 파싱·검증, `@Public` 우회, `@CurrentUser` 데코레이터
    - 선행. T203 · 예상. 0.5h
- [ ] **T208** `APP_GUARD` 글로벌 등록, OTP 엔드포인트는 `@Public`
    - 선행. T207 · 예상. 0.2h
- [ ] **T209** AuthService·PinService·JwtService 단위 테스트 (12건 내외)
    - 선행. T205 · 예상. 2h
- [ ] **T210** AuthGuard 단위 테스트 (4건)
    - 선행. T207 · 예상. 0.5h

### P3. 모바일 가입·로그인 UI

- [ ] **T301** `apps/mobile/lib/features/auth/data/auth_api.dart` — Dio 기반 REST 클라이언트 (OTP 발송·검증, 가입 완료, 로그인, refresh, 번호 변경, 로그아웃, me)
    - 선행. T206 · 예상. 1.5h
- [ ] **T302** `auth/data/secure_token_storage.dart` — flutter_secure_storage 래퍼 (access·refresh·deviceId 저장·조회·삭제)
    - 선행. 없음 · 예상. 0.5h
- [ ] **T303** `auth/data/auth_repository.dart` — API + SecureStorage 결합, Riverpod provider
    - 선행. T301, T302 · 예상. 1h
- [ ] **T304** `auth/auth_state.dart` 재작성 — `AuthStatus { unknown, signedOut, otpPending, pinSetupPending, authenticated, locked }`, 상태 전이
    - 선행. T303 · 예상. 1h
- [ ] **T305** `auth/presentation/phone_input_screen.dart` — 번호 입력 + "인증번호 받기" 버튼 + +82 고정 표시
    - 선행. T304 · 예상. 1h
- [ ] **T306** `auth/presentation/otp_input_screen.dart` — 6자리 입력 (자동 포커스 이동), 재발송 1분 쿨다운 타이머, 만료 5분 카운트다운
    - 선행. T305 · 예상. 1.5h
- [ ] **T307** `auth/presentation/pin_setup_screen.dart` — PIN 6자리 입력 + 확인 입력, 단순 패턴 거부 메시지
    - 선행. T306 · 예상. 1h
- [ ] **T308** `auth/presentation/biometric_enroll_screen.dart` — local_auth 호출, 등록·건너뛰기 버튼, 디바이스 미지원 시 자동 건너뜀
    - 선행. T307 · 예상. 1h
- [ ] **T309** `auth/presentation/onboarding_consent_screen.dart` — "번호 = 계정" 강한 고지 + 동의 체크박스, 동의 안 하면 가입 진행 불가
    - 선행. T308 · 예상. 0.5h
- [ ] **T310** `app/router.dart` redirect 로직 — AuthStatus별 라우팅 (otpPending → otp 화면, pinSetupPending → pin 화면 등)
    - 선행. T304 · 예상. 0.5h

### P4. 모바일 PIN·생체인식 로그인

- [ ] **T401** `auth/presentation/pin_login_screen.dart` — PIN 6자리 입력, 실패 시 남은 횟수 표시
    - 선행. T303 · 예상. 1h
- [ ] **T402** 앱 부팅 시 생체인식 시도 — refresh token 존재 + 생체인식 등록되어 있으면 LocalAuth 호출, 성공 시 자동 진입
    - 선행. T401 · 예상. 1h
- [ ] **T403** PIN 3회 실패 시 "번호 바꾸셨나요?" 안내 모달 — "SMS 재인증으로 PIN 재설정" 버튼은 PIN 재설정 플로우로
    - 선행. T401 · 예상. 0.5h
- [ ] **T404** PIN 5회 실패 → 423 Locked 응답 처리, 10분 잠금 화면 + 남은 시간 카운트, "SMS 재인증" 버튼
    - 선행. T401 · 예상. 0.5h
- [ ] **T405** PIN 재설정 플로우 — 기존 번호 SMS 인증 재사용 (OTP purpose=RESET) → 새 PIN 설정 화면 재사용 → 잠금 해제 + 로그인
    - 선행. T307, T404 · 예상. 1h
- [ ] **T406** access token 만료 시 Dio 인터셉터로 자동 refresh, refresh 실패 시 로그아웃 처리
    - 선행. T303 · 예상. 1h

### P5. 번호 변경·간접 신호·로그아웃

- [ ] **T501** `settings/presentation/phone_change_screen.dart` — 현재 번호 SMS 인증 → 새 번호 입력 → 새 번호 SMS 인증 → 완료
    - 선행. T306, T405 · 예상. 1.5h
- [ ] **T502** 30일 미접속 감지 — 홈 화면 진입 시 `lastSignInAt` 또는 로컬 캐시 비교, 30일 경과 시 dismissible 배너 노출 (하루 1회)
    - 선행. T303 · 예상. 1h
- [ ] **T503** 온보딩 강한 고지 동의 항목 추가 (T309 와 중복 시 통합)
    - 선행. T309 · 예상. 0h (T309에 통합)
- [ ] **T504** `settings/presentation/logout_action.dart` — 확인 모달 → `/auth/logout` 호출 → SecureStorage 비움 → 로그인 화면
    - 선행. T303 · 예상. 0.5h

### P6. 통합 검증·문서화

- [ ] **T601** flutter test — 가입·로그인·PIN 재설정·번호 변경 위젯 테스트 (8건 이상)
    - 선행. P3~P5 · 예상. 2h
- [ ] **T602** api 단위 테스트 합산 — OTP·Auth·Pin·Jwt 30건 이상, 0 실패
    - 선행. P1~P2 · 예상. (각 태스크에 분산)
- [ ] **T603** 실기기 수동 e2e — Android·iOS 각각 가입·로그인·PIN 재설정·번호 변경·30일 배너·잠금 시나리오
    - 선행. T601 · 예상. 2h
- [ ] **T604** `docs/runbooks/auth-otp.md` — 솔라피 발신번호 등록, JWT 비밀키 로테이션, OTP 리밋 조정 절차
    - 선행. T206 · 예상. 1h
- [ ] **T605** Sentry PII filter 백엔드 적용 확인 — phoneNumber·pin·code 마스킹, 단위 테스트
    - 선행. T206 · 예상. 0.5h

### P7. 보안·운영 보강 (1라운드, /feature-patch auth-login 결과)

- [x] **T701** Refresh token `{tokenId}.{secret}` 형식 + `RefreshToken.lookupKey` 단일 row 조회 도입 (100개 lookup 한계 해소)
    - 위치. `apps/api/src/auth/jwt.service.ts`, `packages/database/prisma/schema/auth.prisma`
- [x] **T702** Refresh 재사용 감지 + `revokeAllForUser` 자동 트리거 (탈취 대응)
    - 위치. `jwt.service.ts` rotate
- [x] **T703** `@nestjs/throttler` 도입 — 글로벌 60초/60req + `/auth/otp/send` 60초/5req
    - 위치. `apps/api/src/app.module.ts`, `auth.controller.ts`
- [x] **T704** OTP verify 5회 시도 제한 (`OtpRequest.verifyAttempts` + 5회 강제 consume)
    - 위치. `apps/api/src/auth/otp.service.ts`
- [x] **T705** OTP 세션 토큰 1회용 (`jti` + `OtpRequest.sessionConsumedAt`)
    - 위치. `otp.service.ts`, `auth.service.ts`, `auth.types.ts`
- [x] **T706** Logout ownership 검증 (`revokeOne(userId, refreshToken)`)
    - 위치. `auth.controller.ts`, `auth.service.ts`, `jwt.service.ts`
- [x] **T707** OTP 코드 해시 bcrypt → HMAC-SHA256 + `timingSafeEqual`
    - 위치. `otp.service.ts`
- [x] **T708** `helmet` 도입 + HSTS 헤더(max-age=1년·includeSubDomains·preload)
    - 위치. `apps/api/src/main.ts`
- [x] **T709** 모바일 PIN 실패 안내 모달 — 백엔드 `remainingAttempts` 기반 (남은 ≤ 2회)
    - 위치. `apps/mobile/lib/features/auth/presentation/pin_login_screen.dart`
- [x] **T710** 모바일 PIN 5회 잠금 카운트다운 UI (423 응답 + `lockedUntil` 파싱)
    - 위치. `pin_login_screen.dart`
- [x] **T711** 생체등록 다이얼로그 (signup 직후) + `AuthPrefs('mc_biometric_enabled')` 플래그
    - 위치. `pin_setup_screen.dart`, 신설 `auth_prefs.dart`
- [x] **T712** 생체인식 자동 시도 가드 (플래그 활성 시에만 LocalAuth 호출)
    - 위치. `pin_login_screen.dart`
- [x] **T713** 30일 미접속 배너 — `AuthState.lastSignInAt` + dismiss 일자 캐시
    - 위치. `app/router.dart`, `auth_state.dart`, `auth_prefs.dart`
- [x] **T714** SolapiService 단위 테스트 신설 (dev 모드, 운영 502 변환, 키 누락)
    - 위치. `apps/api/src/sms/solapi.service.spec.ts`
- [x] **T715** AuthService 통합 흐름 단위 테스트 신설 (9건)
    - 위치. `apps/api/src/auth/auth.service.spec.ts`
- [x] **T716** JwtService 재사용 감지 + revokeOne ownership 테스트
    - 위치. `jwt.service.spec.ts`
- [x] **T717** OtpService verifyAttempts + consumeSession 테스트 (5건)
    - 위치. `otp.service.spec.ts`
- [ ] **T718** Prisma 마이그레이션 적용 — `auth-hardening` (운영자 단계)
    - 명령. `pnpm --filter @my-closet/database exec prisma migrate dev --name auth-hardening`

## 아키텍처 다이어그램

```
[Flutter App]                 [NestJS API]              [솔라피]      [Supabase Postgres]
     │                              │                       │                  │
     │  POST /auth/otp/send         │                       │                  │
     ├─────────────────────────────▶│                       │                  │
     │                              │  send SMS (8원/건)    │                  │
     │                              ├──────────────────────▶│                  │
     │                              │  store OTP hash       │                  │
     │                              ├───────────────────────┼─────────────────▶│
     │  { requestId }               │                       │                  │
     │◀─────────────────────────────┤                       │                  │
     │                              │                       │                  │
     │  사용자가 SMS 6자리 입력     │                       │                  │
     │  POST /auth/otp/verify       │                       │                  │
     ├─────────────────────────────▶│                       │                  │
     │                              │  verify hash, mark    │                  │
     │                              │  consumed             │                  │
     │                              ├───────────────────────┼─────────────────▶│
     │  { otpSessionToken,          │                       │                  │
     │    isNewUser: true }         │                       │                  │
     │◀─────────────────────────────┤                       │                  │
     │                              │                       │                  │
     │  POST /auth/signup/complete  │                       │                  │
     │  { otpSessionToken, pin }    │                       │                  │
     ├─────────────────────────────▶│                       │                  │
     │                              │  bcrypt(pin) +        │                  │
     │                              │  User + Closet upsert │                  │
     │                              ├───────────────────────┼─────────────────▶│
     │                              │  issue JWT pair       │                  │
     │  { access, refresh, user }   │                       │                  │
     │◀─────────────────────────────┤                       │                  │
     │                              │                       │                  │
     │  SecureStorage 저장          │                       │                  │
     │  → 홈 화면                   │                       │                  │
     │                              │                       │                  │

[재방문 — 평소 로그인]
     │  부팅 → refresh token 조회    │                       │                  │
     │  → LocalAuth (생체인식)       │                       │                  │
     │  → POST /auth/refresh         │                       │                  │
     ├─────────────────────────────▶│                       │                  │
     │  { access, refresh }          │                       │                  │
     │◀─────────────────────────────┤                       │                  │
     │  → 홈 화면 (< 2초)            │                       │                  │
```

## 테스트 매트릭스

| #   | 케이스                                              | 입력                                          | 기대 결과                                                   |
| --- | --------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| 1   | 정상 가입 (신규 번호)                               | 010-1234-5678 → OTP 정확 → PIN 654321         | User·Closet 생성, JWT 발급, 홈 진입                         |
| 2   | OTP 코드 불일치                                     | 정확한 번호, 잘못된 6자리                     | 400, 재시도 가능                                            |
| 3   | OTP 만료                                            | 6분 후 코드 입력                              | 410 Gone, 재발송 안내                                       |
| 4   | OTP 발송 쿨다운                                     | 30초 후 재요청                                | 429, "1분 후 다시 시도"                                     |
| 5   | OTP 1시간 5회 초과                                  | 1시간 내 6번째 요청                           | 429, "1시간 후 다시 시도"                                   |
| 6   | 단순 PIN 거부                                       | PIN 111111                                    | 400, "다른 PIN을 사용해주세요"                              |
| 7   | 정상 PIN 로그인                                     | 등록 사용자, 올바른 PIN                       | 200, JWT 발급                                               |
| 8   | PIN 3회 실패                                        | 잘못된 PIN 3회                                | 200(실패) + 안내 모달 노출 트리거                           |
| 9   | PIN 5회 실패 → 잠금                                 | 잘못된 PIN 5회                                | 423 Locked, 10분 잠금                                       |
| 10  | 잠금 중 SMS 재인증으로 PIN 재설정                   | OTP 정확 + 새 PIN                             | 잠금 해제, 새 PIN 적용, JWT 발급                            |
| 11  | refresh token 회전                                  | 유효한 refresh                                | 새 access + 새 refresh, 구 refresh 무효화                   |
| 12  | refresh token 재사용 공격                           | 이미 회전된 refresh                           | 401, 해당 사용자 전체 토큰 무효화 (탈취 감지)               |
| 13  | 번호 변경                                           | 구 번호 OTP + 신 번호 OTP                     | User.phoneNumber 갱신, 모든 refresh token 무효화            |
| 14  | 새 번호 중복                                        | 이미 등록된 번호                              | 409 Conflict                                                |
| 15  | 30일 미접속 복귀                                    | lastSignInAt 31일 전                          | 홈 진입 시 안내 배너 노출                                   |
| 16  | 생체인식 미지원 디바이스                            | 안드로이드 5 또는 LocalAuth 실패              | 자동으로 PIN 입력 화면                                      |
| 17  | 잘못된 번호 형식                                    | "01012345" (8자리)                            | 400, 형식 안내                                              |
| 18  | 솔라피 API 장애                                     | mock으로 throw                                | 502, Sentry 알림, 사용자엔 "잠시 후 다시 시도"              |
| 19  | 로그아웃 후 재진입                                  | logout → 재실행                               | 로그인 화면, 생체인식만으론 진입 불가                       |
| 20  | 동의 미체크 시 가입 차단                            | 온보딩 체크박스 미동의                        | 가입 완료 버튼 비활성화                                     |
