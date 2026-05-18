# Review. auth-login

## 리뷰 개요

- 일자. 2026-05-18 (round 2)
- Spec. docs/features/auth-login/spec.md
- Plan. docs/features/auth-login/plan.md
- 검증 명령. `flutter analyze` (No issues), `flutter test` (26/26), `pnpm --filter @my-closet/api test` (13/13), `pnpm --filter @my-closet/api build` (성공)

---

## 1. Spec 일치 여부

| 처리상태 | 심각도 | 판정    | #   | 요구사항                                                                                       | 근거                                                                                                                                  | 보강 지시 |
| -------- | ------ | ------- | --- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| CLOSED   | -      | DONE    | S1-S12 | round 1에서 확인                                                                              | -                                                                                                                                     | -         |
| OPEN     | High   | PARTIAL | S13 | iOS Universal Link + Android intent-filter                                                     | round 1 동일. 코드 redirectTo는 `AppEnv.authRedirectUri` 로 분리. 네이티브 매니페스트는 운영자 단계.                                  | **ESCALATE.** Bundle ID/Package + OAuth provider 등록 후 plist/manifest 작업. 본 슬러그 코드 범위 외. |
| CLOSED   | -      | DONE    | S14 | 백엔드 로그·Sentry payload PII 마스킹                                                          | request-logging.interceptor.ts(method/path만), global-exception.filter.ts(message/path만) 검토 결과 헤더 노출 없음. 실제 결함 아님. | round 2에서 false alarm으로 확인.                                                                       |

**요약.** DONE 13 / PARTIAL 1 / NOT DONE 0 / CHANGED 0

---

## 2. Plan 일치 여부

| 처리상태 | 심각도 | 판정    | 태스크 | 근거                                                              | 보강 지시 |
| -------- | ------ | ------- | ------ | ----------------------------------------------------------------- | --------- |
| CLOSED   | -      | DONE    | T001-T007 | round 1 확인                                                     | -         |
| OPEN     | Low    | PARTIAL | T008   | AuthGuard e2e (supertest)                                         | apps/api에 e2e 인프라 부재. 단위 11건이 핵심 분기 커버. testcontainers 도입 시 별도 슬러그. |
| CLOSED   | -      | DONE    | T009-T012 | round 1 확인                                                     | -         |
| CLOSED   | -      | DONE    | T013   | UsersService.syncFromAuth 단위 테스트 추가 (신규/email null)      | apps/api/src/users/users.service.spec.ts (2 cases)                                                                                                                                                                                                                                                                                                |
| OPEN     | High   | NOT DONE | T015   | iOS Info.plist / Android intent-filter                            | **ESCALATE.** S13 동일. 사용자 단계.                                                                                                                                                                                                                                                                                                              |
| CLOSED   | -      | DONE    | T014, T016-T027 | round 1 확인                                                | -         |
| OPEN     | Low    | NOT DONE | T028   | 실제 카카오/애플/이메일 수동 e2e                                  | **ESCALATE.** 운영자 단계.                                                                                                                                                                                                                                                                                                                        |
| CLOSED   | -      | DONE    | T029   | analyze/test 통과 (mobile 26/26, api 13/13)                       | -         |

**스코프 이탈.** 없음.

---

## 3. 테스트 커버리지

| 처리상태 | 심각도 | 판정     | 요구사항                                                | 테스트                                                                     | 보강 지시 |
| -------- | ------ | -------- | ------------------------------------------------------- | -------------------------------------------------------------------------- | --------- |
| CLOSED   | -      | TESTED   | AuthService.verify (7건)                                | auth.service.spec.ts                                                       | -         |
| CLOSED   | -      | TESTED   | AuthGuard (4건)                                         | auth.guard.spec.ts                                                         | -         |
| CLOSED   | -      | TESTED   | UsersService.syncFromAuth (신규 + email null)           | users.service.spec.ts                                                      | -         |
| CLOSED   | -      | TESTED   | AuthSyncRepository.sync 매핑 + 누락 케이스              | apps/mobile/test/features/auth_sync_repository_test.dart                   | -         |
| CLOSED   | -      | TESTED   | LoginScreen 약관 동의 게이트                            | apps/mobile/test/features/login_screen_test.dart                            | -         |
| CLOSED   | -      | TESTED   | AuthController 베이스 상태 전이                          | apps/mobile/test/features/auth_state_test.dart                              | -         |
| CLOSED   | -      | TESTED   | go_router redirect                                      | apps/mobile/test/app/router_test.dart                                       | -         |
| OPEN     | Low    | UNTESTED | SupabaseAuthController.refreshToken 성공/실패           | supabase_flutter 공식 mock 패키지 부재. 별도 인터페이스 추출 시 가능. 본 슬러그 보류. | 후속에서 `AuthSessionGateway` 인터페이스로 추출하면 단위 테스트 가능. 본 슬러그 우선순위 낮음. |

**미테스트.** 1건

---

## 4. 발견 항목

| 처리상태 | 심각도 | 신뢰도 | 분류 | 위치 | 내용 | 보강 지시 |
| -------- | ------ | ------ | ---- | ---- | ---- | --------- |
| CLOSED   | -      | 7      | SECURITY | apps/api/src/common/logging                                                          | 백엔드 로그 PII 노출 우려 — 실제 코드 검토 결과 헤더 노출 없음(false alarm)                                                       | round 2에서 확인.                                                              |
| CLOSED   | -      | 7      | DX       | apps/mobile/lib/features/auth/presentation/login_screen.dart                          | redirectScheme 하드코딩 → `AppEnv.authRedirectUri` 로 분리 + 기본값 유지                                                            | round 2에서 완료.                                                              |
| CLOSED   | -      | 6      | BUG      | apps/mobile/lib/features/auth/presentation/post_login_sync.dart                       | sync 실패 시 처리 부재 → try/catch + appLogger.e + Sentry.captureException + rethrow                                                | round 2에서 완료.                                                              |
| OPEN     | Low    | 6      | DX       | apps/api/src/auth/auth.service.ts                                                     | provider 매핑이 service 내부. 본 슬러그 단일 사용처라 분리 비용 > 가치. WONTFIX 권고.                                              | 후속 슬러그에서 user metadata 확장 요구 발생 시 `auth.utils.ts` 추출.            |

### Appendix (confidence 5 미만)

| 처리상태 | 심각도 | 신뢰도 | 분류  | 위치 | 내용 | 보강 지시 |
| -------- | ------ | ------ | ----- | ---- | ---- | --------- |
| OPEN     | Low    | 4      | OTHER | apps/api/src/auth/jwks.service.ts                                  | cooldownDuration 30s 기본. 운영 모니터링 후 조정 가능.                                                                              | 운영 메트릭 보고 검토.                                                          |

---

## 5. 기능 검증

- `flutter analyze` — No issues
- `flutter test` — 26/26 passed
- `pnpm --filter @my-closet/api test` — 13/13 passed
- `pnpm --filter @my-closet/api build` — 성공

수동 검증 필요 (운영자 단계, T028).

1. Supabase 프로젝트에서 Kakao·Apple OAuth provider 등록.
2. iOS Info.plist URL Scheme + Universal Link Associated Domain.
3. Android `AndroidManifest.xml` intent-filter (host: `com.myclosets.app`).
4. dev 빌드 3 provider × 1회 + 토큰 만료/재부팅 시나리오.

---

## 6. 보안 감사

round 1 결과 유지. 백엔드 로그 PII 항목은 false alarm으로 ✅ 처리.

| 항목                                       | 상태 | 비고                                                                                                |
| ------------------------------------------ | ---- | --------------------------------------------------------------------------------------------------- |
| JWT 서명 검증·issuer/audience·시계 스큐    | ✅   | jose + AuthService.verify                                                                           |
| Bearer 스킴 외 차단                        | ✅   | guard 테스트 커버                                                                                   |
| @Public 사용 범위                          | ✅   | /health 1곳                                                                                         |
| 모바일 토큰 저장                           | ✅   | FlutterSecureTokenStorage                                                                           |
| 백엔드 로그 PII 노출                       | ✅   | request-logging/global-filter 모두 헤더 미노출                                                       |
| Sync 트랜잭션 무결성                       | ✅   | prisma.$transaction                                                                                 |
| 의존성 공급망                              | ✅   | 모두 공식 패키지                                                                                    |

---

## 총괄 요약

- **OPEN 합계.** 4건 — S13/T015/T028 (ESCALATE, 동일 사유 1건), T008 (e2e 인프라 부재, 후속), 테스트 1건(refreshToken, supabase mock 부재, WONTFIX), 발견 #4 (provider 매핑 분리, WONTFIX), Appendix 1건 (운영 모니터링).
- **자동 보강 가능.** 0건. round 1+2 에서 처리 가능한 항목 모두 완료.
- **사용자 결정 / 외부 작업.** Supabase 프로젝트 + 카카오/애플 콘솔 + iOS/Android 네이티브 OAuth/딥링크 셋업.
