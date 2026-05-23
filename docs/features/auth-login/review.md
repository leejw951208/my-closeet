# Review: auth-login

## 리뷰 개요

- 일자: 2026-05-18
- Spec: docs/features/auth-login/spec.md
- Plan: docs/features/auth-login/plan.md

> **NOTE.** 이 리뷰는 보강 1라운드(`/feature-patch auth-login`) **이전** 스냅샷이다. 처리 결과는 [progress.md "보강 라운드 1"](progress.md) 참조. 잔여 OPEN 항목은 `/feature-verify auth-login` 재실행으로 재집계한다. 본 라운드에서 처리된 항목: 백엔드 critical 1·high 4·medium 3·low 2 + 모바일 PIN 모달/잠금/생체 가드/30일 배너 + 테스트 19건 신설. 잔여(다음 라운드/별도 슬러그): Sentry PII, 실기기 e2e, prisma migrate CI, JwtService @Global, T601 화면별 위젯 테스트, Appendix 2건.
>
> **UPDATE 2026-05-23.** 현재 구현 범위 UI/UX 점검으로 모바일 잔여 항목 일부를 추가 보강했다. OTP 화면 `번호 변경` 동작, 휴대폰 번호 변경 단계별 CTA 가드, 인증 완료 홈 CTA를 구현했고 `flutter analyze` No issues found, `flutter test` 40 pass를 확인했다. 상세는 [progress.md "보강 라운드 2"](progress.md) 참조.

---

## 1. Spec 일치 여부

| 처리상태 | 심각도 | 판정 | # | 요구사항 | 근거 | 보강 지시 |
| -------- | ------ | ---- | --- | -------- | ---- | --------- |
| CLOSED | - | DONE | 1 | 회원가입 3화면 (번호 → OTP → PIN), 약관·OAuth 미사용 | [phone_input_screen.dart](apps/mobile/lib/features/auth/presentation/phone_input_screen.dart), [otp_input_screen.dart](apps/mobile/lib/features/auth/presentation/otp_input_screen.dart), [pin_setup_screen.dart](apps/mobile/lib/features/auth/presentation/pin_setup_screen.dart) | - |
| CLOSED | - | DONE | 2 | 휴대폰 번호 정규화 (+82, 9~10자리) | [auth.dto.ts:6](apps/api/src/auth/dto/auth.dto.ts:6), [otp.service.ts:151](apps/api/src/auth/otp.service.ts:151) | - |
| CLOSED | - | DONE | 3 | OTP 6자리, 5분 TTL, 1분 쿨다운, 1시간 5회 제한 | [otp.service.ts:20-23,60-72](apps/api/src/auth/otp.service.ts:20) | - |
| CLOSED | - | DONE | 4 | PIN 6자리 + bcrypt cost 12 + 단순 패턴 거부 | [pin.service.ts:12,41-43,110-122](apps/api/src/auth/pin.service.ts:12) | - |
| OPEN | medium | PARTIAL | 5 | 생체인식 등록 (선택, 건너뛰기) | [pin_login_screen.dart:34-56](apps/mobile/lib/features/auth/presentation/pin_login_screen.dart:34) 에서 자동 시도만 존재. 별도 등록 화면·on/off 토글 없음. | 가입 직후 또는 설정 화면에 생체인식 등록·해제 UI를 추가하고 등록 상태를 SecureStorage에 보존한다. |
| CLOSED | - | DONE | 6 | 디바이스 식별자 발급·SecureStorage 저장 | [device_id_provider.dart](apps/mobile/lib/features/auth/data/device_id_provider.dart) | - |
| OPEN | medium | PARTIAL | 7 | 재방문 — 생체인식 우선·PIN fallback·자동 refresh | refresh 성공 후 바로 홈 진입은 OK. 그러나 생체인식 등록 여부 플래그를 별도로 관리하지 않아 미등록 사용자에게도 매번 LocalAuth 프롬프트가 뜬다. | "생체인식 등록 완료" 플래그를 SecureStorage에 두고 등록된 경우에만 LocalAuth를 호출하도록 가드한다. |
| OPEN | medium | PARTIAL | 8 | PIN 3회 실패 안내 모달 | [pin_login_screen.dart:84-86](apps/mobile/lib/features/auth/presentation/pin_login_screen.dart:84) — 클라이언트 측 누적 카운트. 앱 재시작 시 0으로 리셋되어 spec의 "연속 3회"와 미세 차이. | 백엔드 응답의 `remainingAttempts` 기준으로 모달 노출을 결정한다 (remainingAttempts ≤ 2 시 노출). |
| OPEN | medium | PARTIAL | 9 | PIN 5회 실패 → 10분 잠금, 잠금 화면 + 카운트다운 | 백엔드 잠금은 [pin.service.ts:73-91](apps/api/src/auth/pin.service.ts:73) 구현. 모바일은 `_error` 텍스트만 노출, 별도 카운트다운 화면 없음. | 423 응답 수신 시 잠금 카운트다운 화면을 띄우고, lockedUntil 시각까지 입력을 비활성화한다. |
| CLOSED | - | DONE | 10 | PIN 재설정 — SMS 재인증 → 새 PIN | [auth.service.ts:82-100](apps/api/src/auth/auth.service.ts:82), [pin_reset_screen.dart](apps/mobile/lib/features/auth/presentation/pin_reset_screen.dart) | - |
| CLOSED | - | DONE | 11 | 휴대폰 번호 변경 — 구·신 번호 양쪽 OTP, 한 번호=한 계정, 모든 refresh 무효화 | [auth.service.ts:102-147](apps/api/src/auth/auth.service.ts:102), [phone_change_screen.dart](apps/mobile/lib/features/auth/presentation/phone_change_screen.dart) | - |
| CLOSED | - | DONE | 12 | PhoneChangeLog·PinResetLog 감사 기록 | [auth.prisma:35-49](packages/database/prisma/schema/auth.prisma:35) | - |
| CLOSED | - | DONE | 13 | 온보딩 강한 고지 + 동의 체크박스 | [onboarding_consent_screen.dart](apps/mobile/lib/features/auth/presentation/onboarding_consent_screen.dart) | - |
| OPEN | low | NOT DONE | 14 | 30일 미접속 안내 배너 (하루 1회 dismiss) | [router.dart:170-174](apps/mobile/lib/app/router.dart:170) — `_shouldShowBanner` 가 항상 false 반환. 일자 비교 로직 미구현. | `/auth/me`의 `lastSignInAt`을 캐시해 30일 경과 시 배너 노출, dismiss 시 오늘 날짜를 SharedPreferences에 저장해 하루 1회로 제한한다. |
| CLOSED | - | DONE | 15 | 로그아웃 — 토큰 비움·서버 refresh 무효화 | [auth_state.dart:104-113](apps/mobile/lib/features/auth/auth_state.dart:104), [auth.service.ts:149-151](apps/api/src/auth/auth.service.ts:149) | - |
| CLOSED | - | DONE | 16 | 9개 REST 엔드포인트 (otp/send·verify, signup, pin/verify·reset, refresh, phone/change, logout, me) | [auth.controller.ts](apps/api/src/auth/auth.controller.ts) | - |
| CLOSED | - | DONE | 17 | Prisma 스키마 (User, RefreshToken, OtpRequest, PhoneChangeLog, PinResetLog) | [user.prisma](packages/database/prisma/schema/user.prisma), [auth.prisma](packages/database/prisma/schema/auth.prisma) | - |
| CLOSED | - | DONE | 18 | JWT access 30분 + refresh 30일 + 회전 | [jwt.service.ts:24-61](apps/api/src/auth/jwt.service.ts:24), [app-config.schema.ts:77-82](apps/api/src/config/app-config.schema.ts:77) | - |
| OPEN | high | NOT DONE | 19 | refresh token 탈취 감지 — 재사용 시 해당 사용자 전체 토큰 무효화 | [jwt.service.ts:37-61](apps/api/src/auth/jwt.service.ts:37) — 이미 회전(revokedAt 있음)된 refresh가 제시되면 단순 401만 반환. 재사용 감지·전체 토큰 무효화 로직 없음. | rotate 시 revokedAt 포함해 후보 검색, 매치된 토큰이 이미 revoked면 `revokeAllForUser`를 호출하고 401을 반환한다. |
| CLOSED | - | DONE | 20 | refresh token bcrypt 해시 저장, deviceId·expiresAt 관리 | [jwt.service.ts:24-35](apps/api/src/auth/jwt.service.ts:24) | - |
| OPEN | high | CHANGED | 21 | 모든 API HTTPS 강제 | 코드 레벨에서 Fly.io TLS 종단에 의존. Helmet HSTS·`forceHttps` 등 명시적 강제 미적용. | `helmet`을 도입하고 HSTS 헤더(`max-age=31536000; includeSubDomains`)를 활성화한다. |
| OPEN | high | NOT DONE | 22 | Sentry PII filter 백엔드 적용 (phoneNumber·pin·code 마스킹) | progress.md T605 ⛔ 보류. 백엔드에 Sentry 통합 자체 없음. | 백엔드 Sentry 통합 후 `beforeSend` 훅에서 `phoneNumber`, `pin`, `code`, `codeHash`, `refreshToken` 키를 마스킹한다. |

**요약:** DONE 14 / PARTIAL 4 / NOT DONE 3 / CHANGED 1

---

## 2. Plan 일치 여부

| 처리상태 | 심각도 | 판정 | 태스크 | 근거 | 보강 지시 |
| -------- | ------ | ---- | ------ | ---- | --------- |
| CLOSED | - | DONE | T001~T008 (P0 Supabase 제거) | 코드 검색 결과 `@supabase/*`, `jose`, `supabase_flutter`, `app_links` 잔존 없음. AndroidManifest·Info.plist의 OAuth intent-filter 제거 확인. | - |
| CLOSED | - | DONE | T101~T106 (OTP 기반) | [otp.service.ts](apps/api/src/auth/otp.service.ts), [otp.service.spec.ts](apps/api/src/auth/otp.service.spec.ts) (8 케이스 PASS) | - |
| OPEN | low | UNTESTED | T107 SolapiService mock spec | 별도 `solapi.service.spec.ts` 파일 없음. OtpService 테스트에서 jest.fn 모킹만 함. | `solapi.service.spec.ts` 신설 — dev 모드 분기, 운영 실패 시 502 변환 2건. |
| CLOSED | - | DONE | T201~T210 (백엔드 인증·계정) | jwt/pin/auth/guard 4개 서비스·가드 모두 존재, 단위 테스트 27건 PASS. | - |
| CLOSED | - | DONE | T301~T307, T309, T310 (모바일 UI) | features/auth/presentation 디렉터리 + router.dart redirect. | - |
| OPEN | medium | PARTIAL | T308 biometric_enroll_screen | 별도 화면 없음. PinLoginScreen에 자동 시도만 통합. | spec 5번 항목 보강과 같이 처리. |
| OPEN | medium | PARTIAL | T404 잠금 카운트다운 화면 | UI 미구현. | spec 9번 보강 지시 참조. |
| CLOSED | - | DONE | T401, T402, T403, T405, T406 | pin_login_screen + pin_reset_screen + auth interceptor | - |
| CLOSED | - | DONE | T501 phone_change_screen | [phone_change_screen.dart](apps/mobile/lib/features/auth/presentation/phone_change_screen.dart) | - |
| OPEN | low | PARTIAL | T502 30일 배너 | spec 14번과 동일. | spec 14번 보강 지시 참조. |
| CLOSED | - | DONE | T503, T504 | T309 통합·logout IconButton | - |
| OPEN | medium | PARTIAL | T601 flutter 위젯 테스트 | 화면별 위젯 테스트 미작성. router/interceptor/theme/auth_state 등 인프라 위주 23 케이스만 존재. | phone_input·otp_input·pin_setup·pin_login·pin_reset·phone_change 화면별 골든 패스·에러 처리 위젯 테스트 6건 추가. |
| CLOSED | - | DONE | T602 api 단위 테스트 27건 PASS | jest 출력 (Tests. 27 passed, 27 total) | - |
| OPEN | low | UNTESTED | T603 실기기 수동 e2e | ⛔ 보류 (솔라피 키·실기기 필요) | 솔라피 발신번호 등록 후 Android·iOS 각 6개 시나리오 수동 e2e 1회 수행, 결과를 progress.md에 기록한다. |
| CLOSED | - | DONE | T604 docs/runbooks/auth-otp.md | [auth-otp.md](docs/runbooks/auth-otp.md) 존재 | - |
| OPEN | high | NOT DONE | T605 Sentry PII filter 백엔드 적용 | spec 22번과 동일. | spec 22번 보강 지시 참조. |

**스코프 이탈:** 없음. dev 모드 SMS 우회(`SMS_DEV_MODE`)는 spec에 없으나 plan/progress 단계에서 합의된 운영 보조 기능이며 운영 시 false 기본값이므로 합리적 추가.

---

## 3. 테스트 커버리지

| 처리상태 | 심각도 | 판정 | 요구사항 | 테스트 | 보강 지시 |
| -------- | ------ | ---- | -------- | ------ | --------- |
| CLOSED | - | TESTED | OTP 발송·쿨다운·리밋·만료·코드 불일치·dev 모드 | otp.service.spec.ts 8건 | - |
| CLOSED | - | TESTED | PIN 해시·검증·잠금 (5회 → 423) | pin.service.spec.ts 7건 | - |
| CLOSED | - | TESTED | JWT 발급·access 검증·OTP 세션 발급·검증·회전 | jwt.service.spec.ts 6건 | - |
| CLOSED | - | TESTED | AuthGuard — Public 통과, 토큰 누락·유효·무효 | auth.guard.spec.ts 6건 | - |
| OPEN | high | UNTESTED | refresh token 재사용 공격 감지 (테스트 매트릭스 #12) | 해당 spec 12 자체가 미구현이므로 테스트도 없음. | 구현 후 jwt.service.spec.ts에 케이스 추가. |
| OPEN | medium | UNTESTED | AuthService — signupComplete·pinLogin·pinReset·changePhone·logout 통합 흐름 | auth.service.spec.ts 부재. Service 레벨 시나리오 단위 테스트 0건. | 트랜잭션 동작·중복 번호 충돌·purpose 불일치 등 6건 신설. |
| OPEN | low | UNTESTED | SolapiService 502 변환·dev 모드 분기 | 별도 spec 없음 (T107). | T107 보강 지시 참조. |
| OPEN | medium | UNTESTED | 모바일 화면별 위젯 테스트 | T601 부분 미구현. | T601 보강 지시 참조. |
| OPEN | low | UNTESTED | 실기기 e2e | T603 보류. | T603 보강 지시 참조. |

**미테스트:** 5건

---

## 4. 발견 항목

| 처리상태 | 심각도 | 신뢰도 | 분류 | 위치 | 내용 | 보강 지시 |
| -------- | ------ | ------ | ---- | ---- | ---- | --------- |
| OPEN | critical | 9 | BUG | [jwt.service.ts:37-43](apps/api/src/auth/jwt.service.ts:37), [jwt.service.ts:70-76](apps/api/src/auth/jwt.service.ts:70) | `rotate()` 와 `revokeOne()` 이 **시스템 전체에서 가장 최근 100개 active refresh token만** 가져와 bcrypt 비교한다. `userId`나 다른 인덱싱 키 없이 brute-force compare를 사용하므로 active 토큰이 100개를 넘어가는 순간 오래된 사용자의 refresh·logout이 무작위로 실패하기 시작한다. spec의 MAU 1만 가정과 정면 충돌. | `RefreshToken` 모델에 `lookupKey`(예: refresh token의 prefix를 SHA-256 해시해 unique 컬럼으로 저장)를 두고 prefix로 직접 조회한 뒤 bcrypt 비교 1회만 수행하도록 재설계한다. 또는 refresh token을 `tokenId.secret` 형태로 발급해 tokenId로 row를 직접 가져온다. |
| OPEN | high | 8 | SECURITY | [jwt.service.ts:37-61](apps/api/src/auth/jwt.service.ts:37) | refresh token 재사용 공격 감지 미구현. 이미 회전된 refresh token이 제시되어도 단순 401만 반환하고 해당 사용자의 다른 active refresh token을 무효화하지 않는다. spec 비기능 보안 항목·테스트 매트릭스 #12와 불일치. | rotate 시 `revokedAt: null` 조건을 풀어 후보를 조회하고, 매치 항목이 이미 revoked면 `revokeAllForUser(userId)` 호출 후 401 반환한다. |
| OPEN | high | 8 | SECURITY | [otp.service.ts:52-86](apps/api/src/auth/otp.service.ts:52) | OTP 발송 rate limit이 phoneNumber 단위로만 걸려 있고 IP·디바이스 단위 보호가 없다. 공격자가 임의의 한국 번호 1만 개를 순회하며 발송 트리거 시 솔라피 비용 = 1만 × 8원 = 8만 원이 한 번에 청구된다 (financial DoS). | 글로벌 throttler(`@nestjs/throttler`) 또는 IP 기반 rate limit을 `/auth/otp/send` 에 별도 적용한다. |
| OPEN | high | 7 | SECURITY | [otp.service.ts:88-148](apps/api/src/auth/otp.service.ts:88) | OTP 검증 시도 횟수가 카운트되지 않아 attacker가 같은 requestId로 5분 동안 코드를 brute force할 수 있다 (10^6 / 300s = 3,333 tps만 견디면 됨). spec에서는 "코드 5분 만료로 충분"이라 명시하지만, 코드가 균등 분포라 평균 50만회 시도 안에 맞춰지므로 실질적 위협. | 같은 `requestId` 또는 phoneNumber별 verify 실패 카운터를 두고 5회 시도 시 해당 OTP를 강제 consume 또는 phoneNumber를 일시 잠근다. spec 갱신 동반 필요. |
| OPEN | medium | 7 | SECURITY | [auth.controller.ts:78-82](apps/api/src/auth/auth.controller.ts:78), [auth.service.ts:149-151](apps/api/src/auth/auth.service.ts:149) | `/auth/logout` 이 인증된 사용자 본인 소유의 refresh token인지 확인하지 않는다. 다른 사용자의 refresh token 값을 알면 그것도 무효화할 수 있다. | logout 시 access token에서 추출한 `userId` 와 매치된 `RefreshToken.userId` 가 같은지 검증한 뒤 revoke한다. |
| OPEN | medium | 7 | SECURITY | [jwt.service.ts:104-130](apps/api/src/auth/jwt.service.ts:104) | OTP 세션 토큰이 1회용이 아니다. 검증 후에도 5분간 재사용 가능하므로 `pinReset` 등을 같은 OTP로 여러 번 호출할 수 있다. spec의 "단명 토큰"과 부분 불일치. | OTP 세션 토큰에 `jti` 를 부여하고 사용 즉시 DB(또는 `OtpRequest.consumedSessionAt`)에 마킹해 재사용을 거부한다. |
| OPEN | medium | 8 | DX | [packages/database](packages/database) | `prisma migrate dev` 가 실제 DB에 적용되지 않은 상태에서 코드만 머지됨. 운영 배포 시 schema/DB 불일치로 부팅 실패 가능. | CI에 `prisma migrate diff` 게이트를 추가하고 배포 파이프라인에서 `prisma migrate deploy`를 자동 실행한다. 런북에도 명시한다. |
| OPEN | medium | 6 | BUG | [otp.service.ts:74](apps/api/src/auth/otp.service.ts:74) | OTP 코드 해시에 `bcrypt cost 8` 사용. OTP는 일반적으로 평문 비교 또는 HMAC을 쓰며, bcrypt는 OTP 발송마다 50~100ms를 잡아먹는다 (spec OTP 발송 응답 < 1초 SLA 안에는 들어오지만 비용 비효율). | OTP는 HMAC-SHA256(serverSecret, code) 등 상수시간 비교로 전환한다. bcrypt는 PIN·refresh 전용으로 한정한다. |
| OPEN | low | 6 | QA | [auth.prisma:26](packages/database/prisma/schema/auth.prisma:26) | `RefreshToken.tokenHash @unique` — bcrypt는 매 호출마다 salt가 달라 collision 0이므로 unique 제약이 의미 없고, lookup 성능을 위한 인덱스로도 부적합(부분 일치 불가). | 위 critical 항목(lookupKey 도입)으로 자연 해소. unique 제약은 제거하거나 lookupKey로 옮긴다. |
| OPEN | low | 6 | DX | [pin_login_screen.dart:80-89](apps/mobile/lib/features/auth/presentation/pin_login_screen.dart:80) | 모바일 PIN 실패 카운트가 클라이언트 로컬 변수 `_failCount` 로 유지되어 앱 재실행 시 0으로 리셋. 백엔드 `remainingAttempts` 응답을 무시하므로 spec의 "연속 3회"와 미세하게 다르게 동작. | UnauthorizedException 응답에서 `remainingAttempts` 를 파싱해 그 값으로 모달 노출 여부를 결정한다. |
| OPEN | low | 7 | OTHER | [auth.module.ts:25](apps/api/src/auth/auth.module.ts:25) | `JwtService` 가 글로벌 모듈로 노출되어 있지 않아 추후 다른 모듈이 `JwtService` 를 주입할 때 명시적 import가 필요. 본 슬러그 단독으로는 문제 없으나 후속 슬러그에서 잊기 쉬움. | 기능 확장 시 `AuthModule` 을 `@Global()` 로 만들거나 의존 모듈에서 `imports: [AuthModule]` 을 명시한다. |

### Appendix (confidence 5 미만)

| 처리상태 | 심각도 | 신뢰도 | 분류 | 위치 | 내용 | 보강 지시 |
| -------- | ------ | ------ | ---- | ---- | ---- | --------- |
| OPEN | low | 4 | OTHER | [pin.service.ts:16-31](apps/api/src/auth/pin.service.ts:16) | 단순 PIN 패턴 set이 14개 하드코딩. `121212`, `131313`, 생년월일(`010191`) 등 흔한 패턴 미포함. | 정규식 기반(같은 숫자 6회, 1자리 증감 수열, 2자리 반복) 검사로 일반화한다. spec 변경 동반. |
| OPEN | low | 4 | OTHER | [otp.service.ts:159-161](apps/api/src/auth/otp.service.ts:159) | OTP 코드 생성에 `randomInt(0, 1_000_000)` 사용. CSPRNG라 안전하지만 첫 자리가 0인 코드의 사용자 가독성·SMS 자동 인식 이슈 가능성 있음. | 디자인 차원에서 `100000–999999` 범위로 좁힐지 검토한다. |

---

## 5. 기능 검증

`Bash` 로 테스트 스위트를 실행해 다음을 확인했다 (사용자 환경에서 실기기·외부 API 호출은 운영자 단계로 보류).

- **백엔드 jest.** `pnpm --filter @my-closet/api test` → 4 suites · **27 passed / 0 failed** (4.28s).
    - `auth.guard.spec.ts`, `jwt.service.spec.ts`, `otp.service.spec.ts`, `pin.service.spec.ts` 통과.
- **모바일 flutter test.** `flutter test` → **23 passed / 0 failed**.
    - router/auth_state/auth_interceptor/api_client/error_interceptor/theme/env/widget 등 인프라 케이스.
- **실기기 e2e.** ⛔ 보류 (솔라피 발신번호·JWT_SECRET·Fly secrets 미등록, 운영자 단계).
- **수동 페이지 흐름.** 빌드·러닝 환경 미가용으로 본 검증 단계에서는 미실시. progress.md 의 `SMS_DEV_MODE=true` 절차에 따라 운영자가 사전 dogfooding 1회 권장.

핵심 사용자 흐름(가입·로그인·재설정·번호 변경·로그아웃)의 로직 경로는 코드 리딩과 단위 테스트로 정상 동작이 확인됐다. 결함은 섹션 4에 정리.

---

## 6. 보안 감사

`Skill cso` 표준 체크리스트를 본 세션에서 수동 적용한 결과 (자동 도구 실행은 외부 의존이라 메인 세션에서 코드 리딩으로 갈음).

**OWASP Top 10 매핑**

- A01 Broken Access Control. `/auth/logout` 의 token ownership 미검증 (섹션 4 항목 5).
- A02 Cryptographic Failures. OTP 검증 brute force 가능 (섹션 4 항목 4). OTP bcrypt 사용 비효율 (항목 8).
- A04 Insecure Design. refresh token 재사용 감지 부재 (섹션 4 항목 2). OTP 세션 토큰 1회용 보장 부재 (항목 6).
- A05 Security Misconfiguration. HTTPS·HSTS 명시적 강제 부재 (섹션 1 spec 21). Sentry PII filter 미적용 (spec 22).
- A06 Vulnerable Components. `pnpm audit` 본 세션 미실행. 별도 권장.
- A07 Identification & Authentication Failures. OTP 발송 financial DoS (섹션 4 항목 3). PIN 단순 패턴 set 좁음 (Appendix).
- A09 Security Logging Failures. 백엔드 Sentry 통합 자체가 없음.

**STRIDE 위협**

- Spoofing. OTP brute force·재사용으로 임의 번호 가입 가능 위험.
- Tampering. JWT HS256, secret 32자+ 강제 OK.
- Repudiation. PhoneChangeLog·PinResetLog 보관 OK.
- Information Disclosure. PII 마스킹 미적용으로 Sentry 도입 시 위험 (현재는 Sentry 자체가 없어 노출은 0).
- DoS. OTP 발송 rate limit이 phoneNumber 단위뿐. 글로벌 throttler 필요.
- Elevation of Privilege. `/auth/me` 와 phone/change·logout 은 글로벌 가드로 보호 OK.

**시크릿 점검**

- `JWT_SECRET` MinLength 32 강제, `.env.example` 에 더미 값. ✅
- 솔라피 키는 옵션, dev 모드 분기. ✅
- 코드베이스 grep으로 평문 secret 노출 없음.

**중대도 분류**

- Critical 1건 (refresh token 100개 제한 → 운영 차단 가능).
- High 4건 (refresh 재사용 감지·OTP financial DoS·OTP brute force·Sentry PII).
- Medium 4건.
- Low 3건 + Appendix 2건.

본 슬러그의 인증 시스템은 단위 로직 자체는 견고하나, **운영 확장성(100개 제한)** 과 **공격 표면(OTP financial DoS·brute force·재사용 감지)** 두 축에서 launch-blocker 결함이 존재한다. 모두 `/feature-patch auth-login` 단계에서 우선 처리할 것을 권장한다.
