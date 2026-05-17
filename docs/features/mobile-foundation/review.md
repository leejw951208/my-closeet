# Review. mobile-foundation

## 리뷰 개요

- 일자. 2026-05-18 (round 2, Crashlytics 스코프 정리 반영)
- Spec. docs/features/mobile-foundation/spec.md (Crashlytics 제외로 갱신)
- Plan. docs/features/mobile-foundation/plan.md (T018 삭제, T019/T021 Sentry 단독으로 갱신)
- 검증 명령. `flutter analyze` (No issues), `flutter test` (22/22 passed)

---

## 1. Spec 일치 여부

| 처리상태 | 심각도 | 판정     | #   | 요구사항                                                                                          | 근거                                                                                                                                                          | 보강 지시 |
| -------- | ------ | -------- | --- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| CLOSED   | -      | DONE     | S1  | 디자인 시스템. ColorScheme 라이트/다크                                                            | apps/mobile/lib/core/theme/app_colors.dart                                                                                                                    | -         |
| CLOSED   | -      | DONE     | S2  | Typography 스케일                                                                                 | apps/mobile/lib/core/theme/app_typography.dart                                                                                                                | -         |
| CLOSED   | -      | DONE     | S3  | Spacing 토큰                                                                                      | apps/mobile/lib/core/theme/app_spacing.dart + EnvErrorApp 사용 사례                                                                                          | -         |
| CLOSED   | -      | DONE     | S4  | Radius 토큰                                                                                       | apps/mobile/lib/core/theme/app_spacing.dart                                                                                                                   | -         |
| CLOSED   | -      | DONE     | S5  | ThemeData + ThemeMode.system                                                                      | apps/mobile/lib/app/app.dart, test/core/theme_test.dart                                                                                                       | -         |
| CLOSED   | -      | DONE     | S6  | go_router 6개 라우트                                                                              | apps/mobile/lib/app/router.dart                                                                                                                               | -         |
| CLOSED   | -      | DONE     | S7  | 인증 redirect                                                                                     | apps/mobile/lib/app/router.dart, test/app/router_test.dart                                                                                                    | -         |
| CLOSED   | -      | DONE     | S8  | AppRoute enum                                                                                     | apps/mobile/lib/app/router.dart                                                                                                                               | -         |
| CLOSED   | -      | DONE     | S9  | ProviderScope + 옵저버                                                                            | apps/mobile/lib/main.dart                                                                                                                                     | -         |
| CLOSED   | -      | DONE     | S10 | authStateProvider 인터페이스                                                                      | apps/mobile/lib/features/auth/auth_state.dart                                                                                                                 | -         |
| CLOSED   | -      | DONE     | S11 | apiClientProvider                                                                                 | apps/mobile/lib/core/network/api_client.dart, test/core/api_client_test.dart                                                                                  | -         |
| CLOSED   | -      | DONE     | S12 | Dio BaseOptions                                                                                   | apps/mobile/lib/core/network/api_client.dart                                                                                                                  | -         |
| CLOSED   | -      | DONE     | S13 | AuthInterceptor JWT 부착                                                                          | apps/mobile/lib/core/network/auth_interceptor.dart, test/core/auth_interceptor_test.dart                                                                      | -         |
| CLOSED   | -      | DONE     | S14 | AuthInterceptor 401 단발 갱신 + single-flight                                                     | apps/mobile/lib/core/network/auth_interceptor.dart:55-66, test 401→refresh 성공/실패 경로                                                                     | -         |
| CLOSED   | -      | DONE     | S15 | ErrorInterceptor 매핑                                                                             | test/core/error_interceptor_test.dart                                                                                                                         | -         |
| CLOSED   | -      | DONE     | S16 | 예외 타입                                                                                         | test/core/api_exception_test.dart                                                                                                                             | -         |
| CLOSED   | -      | DONE     | S17 | EnvErrorApp                                                                                       | test/widget_test.dart                                                                                                                                         | -         |
| CLOSED   | -      | DONE     | S18 | runZonedGuarded + Sentry 라우팅                                                                   | apps/mobile/lib/main.dart                                                                                                                                     | -         |
| CLOSED   | -      | DONE     | S19 | Sentry tracesSampleRate 0.1 + beforeSend (PII 마스킹 + 401/404 필터)                              | apps/mobile/lib/core/logging/pii_filter.dart, test/core/pii_filter_test.dart                                                                                  | -         |
| CLOSED   | -      | DONE     | S20 | 환경변수 빌드 모드별 분리 + prod 시 SENTRY_DSN 필수 검증                                          | apps/mobile/lib/core/env/app_env.dart:22-26                                                                                                                   | -         |
| CLOSED   | -      | DONE     | S21 | 크래시 리포팅. (수정) Sentry 단일 결선 — tech-stack.md 2.6에 따라 Crashlytics 비채택              | spec.md "크래시 리포팅" 섹션 갱신, plan.md T018 삭제·T019/T021 Sentry 단독으로 정리                                                                            | -         |
| CLOSED   | -      | DONE     | S22 | flutter_secure_storage 인터페이스                                                                 | apps/mobile/lib/core/storage/secure_token_storage.dart                                                                                                        | -         |
| CLOSED   | -      | DONE     | S23 | Sentry PII 필터                                                                                   | apps/mobile/lib/core/logging/pii_filter.dart                                                                                                                  | -         |

**요약.** DONE 23 / PARTIAL 0 / NOT DONE 0 / CHANGED 0

---

## 2. Plan 일치 여부

| 처리상태 | 심각도 | 판정     | 태스크 | 근거                                                            | 보강 지시 |
| -------- | ------ | -------- | ------ | --------------------------------------------------------------- | --------- |
| CLOSED   | -      | DONE     | T001-T016 | 모두 완료 (round 1에서 확인)                                  | -         |
| CLOSED   | -      | DONE     | T017   | AuthInterceptor 통합 테스트(401→refresh 성공/실패) 추가         | -         |
| CLOSED   | -      | DONE     | T018   | (삭제됨) tech-stack.md 2.6에 따라 Crashlytics 비채택            | -         |
| CLOSED   | -      | DONE     | T019   | runZonedGuarded + FlutterError.onError → Sentry 라우팅          | -         |
| CLOSED   | -      | DONE     | T020   | Sentry beforeSend                                               | -         |
| OPEN     | Low    | PARTIAL  | T021   | 강제 throw 수동 verification (DSN 주입 후 운영자 점검)          | 코드만으로 닫히지 않는 운영 점검 항목. 실제 SENTRY_DSN 주입 후 dev 빌드에서 강제 throw → Sentry Issues 수신 확인. progress.md에 점검 절차로 보존. |
| CLOSED   | -      | DONE     | T022   | README.md                                                       | -         |
| CLOSED   | -      | DONE     | T023   | analyze (No issues) / test (22/22)                              | -         |

**스코프 이탈.** 없음.

---

## 3. 테스트 커버리지

| 처리상태 | 심각도 | 판정     | 요구사항                                                | 테스트                                       | 보강 지시 |
| -------- | ------ | -------- | ------------------------------------------------------- | -------------------------------------------- | --------- |
| CLOSED   | -      | TESTED   | EnvErrorApp 누락 키 표시                                | test/widget_test.dart                        | -         |
| CLOSED   | -      | TESTED   | AppEnv.validate (dev/prod)                              | test/core/env_test.dart                      | -         |
| CLOSED   | -      | TESTED   | ApiException 계열                                       | test/core/api_exception_test.dart            | -         |
| CLOSED   | -      | TESTED   | ErrorInterceptor 매핑                                   | test/core/error_interceptor_test.dart        | -         |
| CLOSED   | -      | TESTED   | AuthController 상태 전이                                | test/features/auth_state_test.dart           | -         |
| CLOSED   | -      | TESTED   | go_router redirect                                      | test/app/router_test.dart                    | -         |
| CLOSED   | -      | TESTED   | AuthInterceptor 401 → refresh 성공/실패                 | test/core/auth_interceptor_test.dart         | -         |
| CLOSED   | -      | TESTED   | filterSentryEvent PII 마스킹 + 401 필터                 | test/core/pii_filter_test.dart               | -         |
| CLOSED   | -      | TESTED   | 다크 모드 ThemeMode.system 전환                         | test/core/theme_test.dart                    | -         |
| CLOSED   | -      | TESTED   | apiClientProvider 인터셉터 등록                         | test/core/api_client_test.dart               | -         |

**미테스트.** 0건

---

## 4. 발견 항목

| 처리상태 | 심각도 | 신뢰도 | 분류 | 위치 | 내용 | 보강 지시 |
| -------- | ------ | ------ | ---- | ---- | ---- | --------- |
| CLOSED   | -      | 8      | BUG      | apps/mobile/lib/core/network/auth_interceptor.dart                | round 1 #1 — 임시 Dio로 재시도 + 동시성 보호 약함. single-flight refresh와 retryDioFactory 주입으로 같은 Dio 재사용. | round 1에서 완료. |
| CLOSED   | -      | 7      | SECURITY | apps/mobile/lib/core/logging/pii_filter.dart                       | round 1 #2 — beforeSend PII 마스킹. 헤더·user.email 제거, 이메일/Bearer 패턴 마스킹.                              | round 1에서 완료. |
| CLOSED   | -      | 8      | DX       | apps/mobile/lib/core/env/app_env.dart:22-26                        | round 1 #3 — prod 모드에서 SENTRY_DSN 필수화.                                                                     | round 1에서 완료. |
| OPEN     | Low    | 6      | DX       | apps/mobile/lib/app/router.dart                                    | `_PlaceholderScreen` private. 후속 슬러그에서 화면이 추가되며 자연 해소될 항목.                                  | 후속 슬러그 작업에서 자연 해소되므로 별도 보강 없음. **CLOSE-WONTFIX 권고.**                                    |
| CLOSED   | -      | 7      | QA       | apps/mobile/lib/app/env_error_app.dart                             | round 1 #5 — AppSpacing 토큰 사용 사례 도입.                                                                       | round 1에서 완료. |

### Appendix (confidence 5 미만)

| 처리상태 | 심각도 | 신뢰도 | 분류  | 위치 | 내용 | 보강 지시 |
| -------- | ------ | ------ | ----- | ---- | ---- | --------- |
| OPEN     | Low    | 4      | OTHER | apps/mobile/lib/core/network/auth_interceptor.dart | single-flight refresh로 동시 401 처리 안정성 확보. 추가 보강 없음.                                                | round 1에서 single-flight 적용으로 사실상 해소.                                                                  |
| OPEN     | Low    | 4      | OTHER | apps/mobile/lib/core/network/api_client.dart        | LogInterceptor requestBody=true로 변경해 dev 디버깅 가치 확보.                                                    | round 1에서 완료.                                                                                                |

---

## 5. 기능 검증

- `flutter analyze` — No issues (lib + test)
- `flutter test` — 22 / 22 passed
- 신규 통합 테스트. AuthInterceptor 401→refresh 성공/실패, filterSentryEvent PII 마스킹, ThemeMode.system 다크, apiClientProvider 인터셉터 체인.

수동 검증 권장 (변동 없음).

1. `flutter run --dart-define=API_BASE_URL=...` 부팅.
2. `SENTRY_DSN` 주입 후 강제 throw로 Sentry 수신 확인.
3. OS 다크 모드 토글.

---

## 6. 보안 감사

| 항목                | 상태 | 비고                                                          |
| ------------------- | ---- | ------------------------------------------------------------- |
| 시크릿 하드코딩     | ✅   | 변동 없음.                                                    |
| HTTP 평문 통신      | ⚠️   | `apiBaseUrl` https 강제 검증 미도입 — 후속 작업 권고.         |
| 토큰 저장 위치      | ✅   | SecureTokenStorage 인터페이스 + flutter_secure_storage 구현.   |
| 로그 PII 노출       | ✅   | filterSentryEvent로 헤더·이메일 마스킹 + 401/404 필터.        |
| LogInterceptor      | ✅   | 헤더 false. requestBody는 dev에서만 true. 운영 빌드 영향 없음. |
| 의존성 공급망       | ✅   | 변동 없음.                                                    |
| 인증 우회           | ✅   | 변동 없음.                                                    |
| 401 무한 갱신 루프  | ✅   | single-flight + `_retried` 플래그.                            |

---

## 총괄 요약

- **OPEN 합계.** 2건 — 발견 #4 (Low, CLOSE-WONTFIX) + T021 (운영자 수동 점검 항목).
- **차단성 결함.** 없음.
- **사용자 결정.** Crashlytics 비채택 확정 (tech-stack.md 2.6 준수). spec.md/plan.md를 그에 맞춰 정리 완료.
