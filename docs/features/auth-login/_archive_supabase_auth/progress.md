# Progress. 사용자 로그인 (Auth Login)

## 현재 단계

구현

## 기능별 진행 현황

| 태스크 | 설명                                                                          | 상태       |
| ------ | ----------------------------------------------------------------------------- | ---------- |
| T001   | apps/api/src/auth 모듈 디렉토리                                               | ✅ 완료    |
| T002   | JwksService — jose.createRemoteJWKSet(5분 cacheMaxAge)                        | ✅ 완료    |
| T003   | AuthService.verify — 서명·만료·issuer·audience·clockTolerance 60s             | ✅ 완료    |
| T004   | AuthGuard — Bearer 파싱·@Public 우회·401 표준 응답                            | ✅ 완료    |
| T005   | @CurrentUser ParamDecorator                                                   | ✅ 완료    |
| T006   | APP_GUARD 글로벌 등록 + GET /auth/me 라우트                                   | ✅ 완료    |
| T007   | AuthService 단위 테스트 (7건)                                                 | ✅ 완료    |
| T008   | AuthGuard 단위 테스트 (4건) — Nest e2e는 후속(테스트 인프라 부재)             | 🟡 부분    |
| T009   | User.id = Supabase sub UUID 호환성 확인 (이미 @db.Uuid)                       | ✅ 완료    |
| T010   | UsersService.syncFromAuth — prisma.$transaction + user/closet upsert         | ✅ 완료    |
| T011   | AuthController.POST /auth/sync — @CurrentUser → service                       | ✅ 완료    |
| T012   | AuthProvider enum 매핑 (kakao/apple/email)                                    | ✅ 완료 (AuthService 내부) |
| T013   | UsersService.syncFromAuth 단위 테스트 (e2e는 인프라 도입 후)                  | ✅ 완료 (단위 2건; e2e는 후속) |
| T014   | pubspec.yaml — supabase_flutter, app_links 추가                               | ✅ 완료    |
| T015   | iOS Info.plist URL Scheme / Android intent-filter                              | ⛔ 보류 (실제 OAuth client id·번들 ID 필요, 운영자 단계) |
| T016   | main.dart — Supabase.initialize(authFlowType: pkce)                           | ✅ 완료    |
| T017   | onAuthStateChange 구독 + SecureTokenStorage 저장/삭제                          | ✅ 완료 (SupabaseAuthController) |
| T018   | refreshToken() — supabase.auth.refreshSession                                  | ✅ 완료    |
| T019   | 앱 부팅 시 세션 복구 — supabase_flutter 자체 persistence로 자동                | ✅ 완료    |
| T020   | LoginScreen — 약관·14세 + 카카오·애플·이메일 매직링크 버튼                    | ✅ 완료    |
| T021   | 카카오 핸들러 — signInWithOAuth(kakao, redirectTo)                            | ✅ 완료 (실제 동작은 T015 이후) |
| T022   | 애플 핸들러 — signInWithOAuth(apple)                                          | ✅ 완료 (동상) |
| T023   | 이메일 매직링크 — signInWithOtp + 발송 안내 화면                              | ✅ 완료    |
| T024   | /auth/sync 호출 — AuthSyncRepository + syncedUserProvider                     | ✅ 완료    |
| T025   | 로그아웃 — SupabaseAuthController.signOut (별도 UI는 후속 슬러그)             | ✅ 완료 (컨트롤러 메서드까지) |
| T026   | router redirect — AuthStatus.unknown 동안 리다이렉트 보류                      | ✅ 완료    |
| T027   | LoginScreen 위젯 테스트 — 약관 미동의/동의 활성화                              | ✅ 완료    |
| T028   | 실제 카카오/애플/이메일 + 토큰 만료/재부팅 수동 e2e                            | ⛔ 보류 (운영 Supabase + OAuth provider 등록 필요) |
| T029   | flutter analyze / flutter test / api test 통과                                | ✅ 완료 (mobile 26/26, api 13/13, 0 issues) |

## 블로커 / 이슈 / 특이사항

- **iOS/Android 네이티브 OAuth 설정 (T015·T021·T022·T028).** Apple Sign-in Service ID, Kakao App Key, Bundle ID/Package, Universal Link associated domain은 실제 콘솔 작업이 필요한 운영자 단계. SDK 코드는 모두 결선되어 있고 콘솔만 셋업하면 동작.
- **백엔드 e2e 테스트 (T008·T013).** apps/api에 e2e 테스트 인프라(test/jest-e2e.json·테스트 DB)가 없다. 단위 테스트(11건)로 핵심 로직은 검증. 후속 슬러그에서 testcontainers 또는 Supabase 로컬로 갖추는 게 자연스럽다.
- **Sentry 백엔드 PII 마스킹.** spec 비기능 요건에 백엔드에도 같은 PII 정책을 적용하라고 적혀 있으나 본 슬러그 범위는 인증. 다음 슬러그 또는 backend-foundation 보강에서 처리.

## 최근 업데이트

2026-05-18

## 다음 액션 아이템

| 담당 | 내용                                                                | 기한 |
| ---- | ------------------------------------------------------------------- | ---- |
|      | `/feature-autoverify auth-login` 으로 검증 진행                     | -    |
|      | 운영자 단계 — Supabase 프로젝트 카카오/애플 provider 등록 + 딥링크 셋업 | -    |
