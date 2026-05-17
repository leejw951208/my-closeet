# Progress. 모바일 기초 인프라 (Mobile Foundation)

## 현재 단계

구현

## 기능별 진행 현황

| 태스크 | 설명                                                            | 상태      |
| ------ | --------------------------------------------------------------- | --------- |
| T001   | pubspec.yaml 의존성 추가 (dio, sentry_flutter, logger, 등)      | ✅ 완료   |
| T002   | lib 디렉토리 구조 확정                                          | ✅ 완료   |
| T003   | 환경변수 로딩 모듈 `core/env/app_env.dart`                      | ✅ 완료   |
| T004   | placeholder 부팅 (EnvErrorApp / MyClosetApp 셸)                 | ✅ 완료   |
| T005   | `core/theme/app_colors.dart` 라이트/다크 ColorScheme            | ✅ 완료   |
| T006   | Typography·Spacing·Radius 토큰                                  | ✅ 완료   |
| T007   | `app_theme.dart` light/dark ThemeData 조립                      | ✅ 완료   |
| T008   | `app/router.dart` GoRouter + AppRoute enum + 6개 placeholder    | ✅ 완료   |
| T009   | 인증 상태 인터페이스와 redirect 결선                            | ✅ 완료   |
| T010   | MaterialApp.router 결선                                         | ✅ 완료   |
| T011   | ProviderScope·LoggingObserver 설정                              | ✅ 완료   |
| T012   | authControllerProvider 스텁                                     | ✅ 완료   |
| T013   | ApiException / UnauthorizedException / NetworkException         | ✅ 완료   |
| T014   | AuthInterceptor (JWT 부착 + 401 단발 갱신)                      | ✅ 완료   |
| T015   | ErrorInterceptor (상태코드 → 도메인 예외 매핑)                  | ✅ 완료   |
| T016   | api_client.dart Dio 팩토리 + apiClientProvider                  | ✅ 완료   |
| T017   | 수동 mock 시나리오 검증                                         | ✅ 완료 (auth_interceptor 통합 테스트로 대체) |
| T018   | (삭제됨) Crashlytics 비채택 (tech-stack.md 2.6)                 | ✅ N/A    |
| T019   | runZonedGuarded + FlutterError.onError → Sentry 라우팅          | ✅ 완료   |
| T020   | Sentry beforeSend 필터 (401/404 + 이메일·토큰 PII 마스킹)        | ✅ 완료   |
| T021   | 강제 throw 시나리오로 Sentry 수신 수동 확인                     | 🟡 운영자 점검 대기 (DSN 주입 후 dev 빌드에서 1회) |
| T022   | README.md 업데이트                                              | ✅ 완료   |
| T023   | `flutter analyze` / `flutter test` 통과                         | ✅ 완료 (22 tests passed, 0 issues) |

## 블로커 / 이슈 / 특이사항

- **Crashlytics 비채택 확정.** tech-stack.md 2.6 결정에 따라 본 슬러그는 Sentry 단일 organization으로 결선. spec/plan에서 Crashlytics 관련 항목을 모두 정리했다.
- **Sentry DSN 미설정 시 동작.** `SENTRY_DSN` 이 비어 있으면 Sentry 초기화를 건너뛰고 앱을 정상 부팅한다(dev 편의). 운영 빌드(`APP_ENV=prod`)는 `AppEnv.validate` 가 DSN 누락을 EnvErrorApp으로 막는다.
- **운영자 수동 점검 (T021).** 실제 DSN 주입 후 dev 빌드에서 임시 throw → Sentry Issues 1건 수신 확인. 점검 후 임시 코드 제거.

## 최근 업데이트

2026-05-18

## 다음 액션 아이템

| 담당 | 내용                                                   | 기한 |
| ---- | ------------------------------------------------------ | ---- |
|      | 운영자가 실제 SENTRY_DSN 주입 후 강제 throw 1회 점검   | -    |
|      | 다음 슬러그 `auth-login` 계획 시작                     | -    |
