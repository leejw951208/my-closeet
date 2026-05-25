# Progress. 사용자 로그인 (SMS + PIN + 생체인식)

## 현재 단계

보강 3라운드 완료 (기존 가입 번호의 SIGNUP OTP 라우팅 보강)

## 기능별 진행 현황

### P0. 기존 Supabase Auth 제거

| 태스크 | 설명                                                                          | 상태       |
| ------ | ----------------------------------------------------------------------------- | ---------- |
| T001   | apps/api/src/auth/ Supabase JWKS·JWT 검증 모듈·테스트 삭제                    | ✅ 완료    |
| T002   | apps/api/src/users/syncFromAuth 등 Supabase sub 기반 동기화 로직 제거          | ✅ 완료 (users 모듈 통째 제거) |
| T003   | apps/api/package.json — jose, supabase 의존성 제거                            | ✅ 완료 (bcryptjs·jsonwebtoken·solapi 추가) |
| T004   | apps/api/.env.example — SUPABASE_* 제거, SOLAPI_*, JWT_* 추가                 | ✅ 완료    |
| T005   | apps/mobile/lib/features/auth/ Supabase 화면·핸들러 삭제                       | ✅ 완료    |
| T006   | apps/mobile/pubspec.yaml — supabase_flutter, app_links 제거                   | ✅ 완료 (local_auth 추가) |
| T007   | main.dart, app_env.dart Supabase 초기화 제거                                  | ✅ 완료    |
| T008   | AndroidManifest.xml, Info.plist OAuth 콜백 제거                                | ✅ 완료    |

### P1. 백엔드 OTP 기반

| 태스크 | 설명                                                                          | 상태       |
| ------ | ----------------------------------------------------------------------------- | ---------- |
| T101   | Prisma OtpRequest 모델 추가                                                   | ✅ 완료    |
| T102   | SolapiService — 솔라피 SDK 연동, sendOtp                                      | ✅ 완료    |
| T103   | OtpService.requestOtp — 코드 생성·해시·TTL·쿨다운·리밋                       | ✅ 완료    |
| T104   | OtpService.verifyOtp + otpSessionToken 발급                                   | ✅ 완료    |
| T105   | /auth/otp/send, /auth/otp/verify 컨트롤러                                     | ✅ 완료    |
| T106   | OtpService 단위 테스트                                                        | ✅ 완료 (8건) |
| T107   | SolapiService mock 단위 테스트                                                | 🟡 부분 (OtpService 테스트에서 간접 검증, 별도 spec은 후속) |

### P2. 백엔드 인증·계정

| 태스크 | 설명                                                                          | 상태       |
| ------ | ----------------------------------------------------------------------------- | ---------- |
| T201   | Prisma User 스키마 수정 (phoneNumber, pinHash, ...)                            | ✅ 완료 (DB 마이그레이션 적용은 ⛔ 운영 환경에서 별도 실행) |
| T202   | Prisma RefreshToken, PhoneChangeLog, PinResetLog 모델 추가                    | ✅ 완료    |
| T203   | JwtService — issuePair, 회전                                                  | ✅ 완료    |
| T204   | PinService — setPin/verifyPin, 잠금                                          | ✅ 완료    |
| T205   | AuthService — signupComplete·pinLogin·pinReset·phoneChange·logout            | ✅ 완료    |
| T206   | 9개 인증 컨트롤러 + DTO                                                       | ✅ 완료    |
| T207   | AuthGuard + @CurrentUser                                                      | ✅ 완료    |
| T208   | APP_GUARD 글로벌 등록                                                          | ✅ 완료    |
| T209   | AuthService·PinService·JwtService 단위 테스트                                 | ✅ 완료 (PinService 7건, JwtService 6건) |
| T210   | AuthGuard 단위 테스트                                                         | ✅ 완료 (4건) |

### P3. 모바일 가입·로그인 UI

| 태스크 | 설명                                                                          | 상태       |
| ------ | ----------------------------------------------------------------------------- | ---------- |
| T301   | auth_api.dart — Dio REST 클라이언트                                           | ✅ 완료    |
| T302   | secure_token_storage.dart                                                     | ✅ 완료 (기존 활용) |
| T303   | auth_repository.dart + Riverpod provider                                      | ✅ 완료    |
| T304   | auth_state.dart 재작성                                                         | ✅ 완료    |
| T305   | phone_input_screen.dart                                                        | ✅ 완료    |
| T306   | otp_input_screen.dart                                                          | ✅ 완료    |
| T307   | pin_setup_screen.dart                                                          | ✅ 완료    |
| T308   | biometric_enroll_screen.dart                                                   | 🟡 부분 (pin_login_screen에 LocalAuth 자동 시도 통합, 별도 등록 화면은 후속 UX) |
| T309   | onboarding_consent_screen.dart                                                 | ✅ 완료    |
| T310   | router.dart redirect 로직                                                      | ✅ 완료    |

### P4. 모바일 PIN·생체인식 로그인

| 태스크 | 설명                                                                          | 상태       |
| ------ | ----------------------------------------------------------------------------- | ---------- |
| T401   | pin_login_screen.dart                                                          | ✅ 완료    |
| T402   | 앱 부팅 시 생체인식 자동 시도                                                  | ✅ 완료 (pin_login_screen.initState) |
| T403   | PIN 3회 실패 안내 모달                                                         | ✅ 완료    |
| T404   | PIN 5회 실패 → 423 잠금 화면                                                  | ✅ 완료 (백엔드 423 응답·lockedUntil 카운트다운 UI, 입력 비활성화) |
| T405   | PIN 재설정 플로우                                                              | ✅ 완료 (pin_reset_screen → otp_input(RESET) → pin_setup(reset)) |
| T406   | Dio 인터셉터 자동 refresh                                                      | ✅ 완료 (기존 AuthInterceptor 재사용) |

### P5. 번호 변경·간접 신호·로그아웃

| 태스크 | 설명                                                                          | 상태       |
| ------ | ----------------------------------------------------------------------------- | ---------- |
| T501   | phone_change_screen.dart                                                       | ✅ 완료 (단계별 OTP/번호 입력 유효성에 따라 CTA 활성화) |
| T502   | 30일 미접속 배너                                                               | ✅ 완료 (`lastSignInAt` 30일 경과 + 하루 1회 dismiss) |
| T503   | (T309에 통합)                                                                  | ✅ 통합 완료 |
| T504   | logout_action.dart                                                             | ✅ 완료 (AppBar IconButton + AuthController.signOut) |

### P6. 통합 검증·문서화

| 태스크 | 설명                                                                          | 상태       |
| ------ | ----------------------------------------------------------------------------- | ---------- |
| T601   | flutter 위젯 테스트                                                           | ✅ 완료 (인증 화면·라우터·번호 변경 UX 포함 40개 케이스 PASS) |
| T602   | api 단위 테스트 합산                                                          | ✅ 완료 (25건 PASS) |
| T603   | 실기기 수동 e2e                                                               | ⛔ 보류 (솔라피 키·실기기 필요한 운영자 단계) |
| T604   | docs/runbooks/auth-otp.md                                                     | ✅ 완료    |
| T605   | Sentry PII filter 백엔드 적용                                                 | ⛔ 보류 (기존 모바일 PII 필터는 유지, 백엔드 Sentry 통합 자체가 별도 슬러그 범위) |

## 추가 변경 (2026-05-18, dev 모드 SMS 우회)

| 항목 | 위치 | 내용 |
| ---- | ---- | ---- |
| 환경변수 `SMS_DEV_MODE` 추가 | `.env.example`, `app-config.schema.ts`, `app-config.service.ts` | 기본 false. true이면 솔라피 호출 우회 + 응답에 devCode 동봉 |
| SolapiService dev 분기 | `apps/api/src/sms/solapi.service.ts` | dev 모드면 `[DEV OTP] +82... → 123987` 콘솔 출력만, 솔라피 클라이언트 생성 자체를 스킵 |
| OtpService devCode 동봉 | `apps/api/src/auth/otp.service.ts` (RequestOtpResult 확장) | dev 모드일 때만 응답에 `devCode: string` 추가 |
| 모바일 자동 채움 | `auth_api.dart`(OtpRequestResult), `signup_flow_state.dart`, `phone_input_screen.dart`, `pin_reset_screen.dart`, `otp_input_screen.dart` | OTP 화면에서 devCode 자동 입력 + 노란 배너로 "DEV 모드. 자동 입력됨" 안내 |
| 백엔드 테스트 추가 | `otp.service.spec.ts` | dev=true → devCode 동봉, dev=false → undefined (2건) |

### dev 모드 사용 방법

1. `apps/api/.env`에 `SMS_DEV_MODE=true` 설정 (또는 .env.example을 .env로 복사)
2. 백엔드 부팅 → `WARN ... SMS_DEV_MODE=true — 실제 SMS 발송을 건너뛰고 콘솔에 코드를 출력합니다.`
3. 모바일에서 번호 입력 → 자동으로 OTP 화면에 코드가 채워짐 → 자동 verify → PIN 설정

운영 전환은 `.env`에서 `SMS_DEV_MODE=false`로 바꾸고 SOLAPI_* 값을 채우면 됨. 코드 변경 불필요.

## 블로커 / 이슈 / 특이사항

- **DB 마이그레이션 미적용.** Prisma 스키마는 갱신되고 generate는 통과하나, 실제 Supabase Postgres에 `prisma migrate dev`를 돌리는 작업은 운영자 단계. 로컬 dev DB가 있다면 `pnpm --filter @my-closet/database exec prisma migrate dev --name auth-phone-pin`.
- **솔라피 API 키·발신번호 미발급.** 런북(`docs/runbooks/auth-otp.md`) 1절 참고. 키 등록 전에는 POST /auth/otp/send가 솔라피 단에서 401/403으로 실패.
- **JWT_SECRET·Fly secrets 미등록.** 런북 2절 참고.
- **bcrypt → bcryptjs 채택.** native 빌드 스크립트 승인이 필요해서 pure-JS bcryptjs로 전환. PIN cost 12, refresh cost 10 그대로.
- **biometric 등록 별도 화면(T308).** 가입 직후 다이얼로그와 로그인 자동 시도는 구현됨. 설정 화면의 on/off 토글은 후속 UX 범위.

## 보강 라운드 1 (2026-05-18, /feature-verify → /feature-patch)

### 백엔드 보안 강화

| 항목 | 위치 | 변경 |
| ---- | ---- | ---- |
| Refresh token lookup 구조 | `apps/api/src/auth/jwt.service.ts`, `auth.prisma` | `tokenId.secret` 형식 발급, `RefreshToken.lookupKey` (UUID prefix의 SHA-256) unique 컬럼 추가. `tokenHash @unique` 제거. rotate/revokeOne이 O(1) 단일 row 조회 + bcrypt 1회로 변경. **100개 lookup 한계 해소.** |
| Refresh 재사용 감지 | `jwt.service.ts` rotate | 이미 회전된 token 재제시 시 `revokeAllForUser` 호출 후 401 (탈취 시 전체 무효화). |
| OTP financial DoS | `apps/api/src/app.module.ts`, `auth.controller.ts` | `@nestjs/throttler` 도입. 글로벌 60초/60req + `/auth/otp/send`에 별도 60초/5req. |
| OTP brute force | `apps/api/src/auth/otp.service.ts` | `OtpRequest.verifyAttempts` 컬럼 추가. 같은 requestId 5회 verify 실패 시 강제 consume + 429. |
| OTP 세션 1회용 | `otp.service.ts`, `auth.service.ts`, `auth.types.ts` | 세션 JWT에 `jti = OtpRequest.id` 부여. `OtpRequest.sessionConsumedAt` 컬럼 추가. signup/pinReset/changePhone 진입 시 `OtpService.consumeSession`으로 1회용 보장. |
| Logout ownership | `auth.controller.ts`, `auth.service.ts`, `jwt.service.ts` | `revokeOne(userId, refreshToken)`. 인증된 사용자의 token이 아니면 무시. |
| OTP 코드 해시 | `otp.service.ts` | bcrypt → HMAC-SHA256(JWT_SECRET). 발송 비용 50~100ms → <1ms. `timingSafeEqual` 사용. |
| HTTPS HSTS | `apps/api/src/main.ts` | `helmet` 도입. HSTS max-age=1년·includeSubDomains·preload. |

### 모바일 UX 보강

| 항목 | 위치 | 변경 |
| ---- | ---- | ---- |
| PIN 실패 안내 모달 | `pin_login_screen.dart` | 백엔드 401 응답의 `remainingAttempts` 파싱. 남은 시도 ≤ 2일 때 "PIN을 잊으셨나요?" 모달 노출. |
| PIN 5회 잠금 화면 | `pin_login_screen.dart` | 423 응답 시 `lockedUntil` 기반 잠금 카운트다운 UI. 입력 비활성화 + "SMS 재인증" CTA. |
| 생체등록 다이얼로그 | `pin_setup_screen.dart`, 신설 `auth_prefs.dart` | signup 모드 가입 직후 LocalAuth 가능 시 등록 다이얼로그. `SecureStorage('mc_biometric_enabled')` 플래그 저장. |
| 생체등록 가드 | `pin_login_screen.dart` | 부팅 시 플래그가 `1`일 때만 LocalAuth 호출 (미등록 사용자에게 불필요한 프롬프트 제거). |
| 30일 미접속 배너 | `app/router.dart`, `auth_state.dart`, `auth_prefs.dart` | `AuthState.lastSignInAt` 보존. 30일 경과 + 오늘 dismiss 안 했을 때만 노출. dismiss 시 `SecureStorage('mc_stale_banner_dismissed_date')` 저장. |

### 테스트 보강

| 항목 | 위치 | 케이스 수 |
| ---- | ---- | --------- |
| SolapiService 단위 | `apps/api/src/sms/solapi.service.spec.ts` (신설) | 3 |
| AuthService 통합 | `apps/api/src/auth/auth.service.spec.ts` (신설) | 9 |
| JwtService 재사용 감지 + revokeOne ownership | `jwt.service.spec.ts` 갱신 | +2 |
| OtpService verifyAttempts + consumeSession | `otp.service.spec.ts` 갱신 | +5 |
| 합계 | | **46건 PASS** (이전 27 → +19) |

### 의존성 추가

- `helmet ^8.1.0`
- `@nestjs/throttler ^6.5.0`

### Prisma 스키마 변경

| 모델 | 변경 |
| ---- | ---- |
| RefreshToken | `lookupKey String @unique` 추가, `tokenHash @unique` 제약 제거 |
| OtpRequest | `verifyAttempts Int @default(0)` 추가, `sessionConsumedAt DateTime?` 추가 |

**⚠️ 마이그레이션 미적용.** generate만 갱신. 운영 배포 전 다음 실행 필요.

```bash
pnpm --filter @my-closet/database exec prisma migrate dev --name auth-hardening
```

### 잔여 OPEN (다음 라운드 또는 별도 슬러그)

- T603 실기기 e2e (운영자 단계)
- T605 백엔드 Sentry PII filter (별도 슬러그)
- DX. prisma migrate CI 게이트 (인프라 슬러그)
- OTHER. `AuthModule @Global()` 적용 (후속 슬러그)
- Appendix. PIN 패턴 정규식 확장, OTP 첫 자리 0 제한

## 보강 라운드 2 (2026-05-23, 현재 구현 범위 UI/UX 점검)

### 모바일 UI/UX 보강

| 항목 | 위치 | 변경 |
| ---- | ---- | ---- |
| 번호 변경 단계별 CTA 가드 | `phone_change_screen.dart` | 현재 번호 OTP 6자리, 새 번호 `010` 11자리, 새 번호 OTP 6자리 조건을 만족할 때만 각 다음 단계 버튼 활성화. 서버 에러 전 사용자가 입력 오류를 바로 알 수 있게 함. |
| OTP 번호 변경 액션 | `otp_input_screen.dart` | 링크처럼 보이던 `번호 변경` 텍스트에 실제 뒤로가기/번호 입력 화면 이동 동작과 underline affordance 추가. |
| 인증 완료 홈 상태 | `router.dart` | 단순 `홈` 텍스트 대신 로그인 완료 메시지, 옷장 확인 CTA, 휴대폰 번호 변경 CTA를 표시. 전체 홈 기능 구현 전에도 인증 완료 감각과 다음 행동을 제공. |

### 테스트 보강

| 항목 | 위치 | 케이스 |
| ---- | ---- | ------ |
| OTP 번호 변경 라우팅 | `auth_screens_test.dart` | `번호 변경` 탭 시 `/auth/phone` 이동 확인. |
| 번호 변경 CTA 활성 조건 | `auth_screens_test.dart` | 현재 OTP, 새 번호, 새 OTP가 유효할 때만 단계별 CTA 활성화 확인. |
| 인증 완료 홈 CTA | `router_test.dart` | 인증 상태 홈에서 완료 메시지와 다음 행동 CTA 노출 확인. |

## 보강 라운드 3 (2026-05-25, 기존 가입 번호 SIGNUP OTP 라우팅)

### 모바일 인증 흐름 보강

| 항목 | 위치 | 변경 |
| ---- | ---- | ---- |
| 기존 사용자 SIGNUP OTP 분기 | `otp_input_screen.dart`, `auth_state.dart` | `verifyOtp` 결과가 `isNewUser=false`이면 `/auth/signup/complete`를 호출하지 않고 해당 번호를 마지막 로그인 번호로 저장한 뒤 `/auth/pin-login`으로 이동. 이미 가입된 번호에서 PIN 설정 실패 메시지가 뜨던 문제를 해소. |

### 테스트 보강

| 항목 | 위치 | 케이스 |
| ---- | ---- | ------ |
| 기존 사용자 OTP 라우팅 | `auth_screens_test.dart` | SIGNUP OTP 검증 결과가 기존 사용자이면 PIN 로그인 화면으로 이동하고 `lastKnownPhoneNumber` 및 prefs에 번호가 저장되는지 확인. |

## 최근 업데이트

2026-05-25 (보강 3라운드 완료)

## 테스트 결과

- **백엔드 jest.** 46개 케이스 / 6개 스위트, 0 실패 (보강 후)
- **모바일 flutter test.** `test/features/auth_screens_test.dart` 11개 케이스, 0 실패 (보강 3라운드 후 부분 회귀)
- **flutter analyze.** No issues found (보강 3라운드 후)
- **tsc --noEmit (apps/api).** 0 error

## 다음 액션 아이템

| 담당   | 내용                                                          | 기한 |
| ------ | ------------------------------------------------------------- | ---- |
| 운영자 | 솔라피 가입·발신번호 등록·API 키 발급 → Fly secrets 등록     | -    |
| 운영자 | Supabase Postgres 마이그레이션 실행 (prisma migrate deploy)   | -    |
| 운영자 | JWT_SECRET 생성·등록                                          | -    |
| 다음   | `/clear` 후 `/feature-verify auth-login` 으로 검증 진행       | -    |
