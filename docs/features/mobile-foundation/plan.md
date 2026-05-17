<!-- mobile-foundation 슬러그의 단계·태스크·아키텍처·테스트 매트릭스. -->

# Plan. 모바일 기초 인프라 (Mobile Foundation)

## 단계 구성

| Phase | 이름                    | 목표                                                                                |
| ----- | ----------------------- | ----------------------------------------------------------------------------------- |
| P1    | 프로젝트 골격 정리      | 의존성·환경변수·디렉토리 구조 확정. `flutter run`이 placeholder 화면으로 부팅된다.  |
| P2    | 디자인 시스템·라우팅    | 토큰·테마·go_router 트리가 적용되어 6개 라우트를 placeholder로 이동할 수 있다.      |
| P3    | 상태관리·API 클라이언트 | ProviderScope·Dio 인터셉터가 동작하고 mock API 호출로 인증/에러 흐름이 검증된다.    |
| P4    | 크래시 리포팅·하드닝    | Sentry가 dev 빌드에서 강제 크래시를 수집한다. 후속 슬러그 진입 준비 끝.             |

## 구현 태스크

### P1. 프로젝트 골격 정리

- [ ] **T001** `pubspec.yaml`에 의존성 추가 (`dio`, `flutter_dotenv` 또는 `--dart-define` 결정, `sentry_flutter`, `firebase_core`, `firebase_crashlytics`, `flutter_secure_storage`, `logger`)
    - 선행. 없음 · 예상. 0.5h
- [ ] **T002** `lib/` 디렉토리 구조 확정 (`app/`, `core/{theme,network,env,logging}/`, `features/`, `shared/`)
    - 선행. T001 · 예상. 0.5h
- [ ] **T003** 환경변수 로딩 모듈 (`core/env/app_env.dart`) — `--dart-define` 기반, 누락 시 명시 예외
    - 선행. T002 · 예상. 1h
- [ ] **T004** placeholder `main.dart`로 `flutter run` 부팅 확인 (Material default 화면)
    - 선행. T003 · 예상. 0.5h

### P2. 디자인 시스템·라우팅

- [ ] **T005** `core/theme/app_colors.dart` 라이트/다크 ColorScheme 정의
    - 선행. T002 · 예상. 1h
- [ ] **T006** `core/theme/app_typography.dart`, `app_spacing.dart`, `app_radius.dart` 토큰 정의
    - 선행. T005 · 예상. 1h
- [ ] **T007** `core/theme/app_theme.dart` — light/dark `ThemeData` 조립 + 확장
    - 선행. T006 · 예상. 1h
- [ ] **T008** `app/router.dart` — `GoRouter`, `AppRoute` enum, 6개 placeholder 라우트(`/login`, `/`, `/register`, `/closet`, `/outfit`, `/calendar`)
    - 선행. T002 · 예상. 1.5h
- [ ] **T009** auth 상태 인터페이스(`features/auth/auth_state.dart`)와 redirect 콜백 연결
    - 선행. T008 · 예상. 1h
- [ ] **T010** `MaterialApp.router`에 테마·라우터 결선, 6개 라우트 수동 네비게이션 검증
    - 선행. T007,T009 · 예상. 0.5h

### P3. 상태관리·API 클라이언트

- [ ] **T011** `ProviderScope`와 `LoggerObserver`(dev 전용) 설정
    - 선행. T004 · 예상. 0.5h
- [ ] **T012** `authStateProvider` 스텁 — 실제 Supabase 연결은 `auth-login`에서, 여기서는 인터페이스·전이만
    - 선행. T011 · 예상. 1h
- [ ] **T013** `core/network/api_exception.dart` — `ApiException`/`NetworkException`/`UnauthorizedException`
    - 선행. T002 · 예상. 0.5h
- [ ] **T014** `core/network/auth_interceptor.dart` — JWT 헤더 부착, 401시 1회 갱신 후 재시도
    - 선행. T012,T013 · 예상. 1.5h
- [ ] **T015** `core/network/error_interceptor.dart` — 상태코드+페이로드 → `ApiException` 매핑
    - 선행. T013 · 예상. 1h
- [ ] **T016** `core/network/api_client.dart` — Dio 팩토리, 인터셉터 체인 조립, `apiClientProvider` 노출
    - 선행. T014,T015 · 예상. 1h
- [ ] **T017** mock 엔드포인트(예: `httpbin.org/status/{200,401,500}`)로 성공·갱신·에러 매핑 수동 시나리오 검증
    - 선행. T016 · 예상. 1h

### P4. 크래시 리포팅·하드닝

- [ ] **T018** ~~Firebase 프로젝트 설정~~ — **삭제**. tech-stack.md 2.6에 따라 Crashlytics 미채택.
- [ ] **T019** `main.dart`에서 `runZonedGuarded` + `FlutterError.onError` → Sentry 라우팅
    - 선행. T001 · 예상. 1h
- [ ] **T020** Sentry `beforeSend` 필터 — 401/404 정상 흐름 제거, 이메일·Bearer 토큰 마스킹
    - 선행. T019 · 예상. 0.5h
- [ ] **T021** 강제 throw 시나리오로 Sentry 대시보드 수신 수동 확인 (DSN 주입 후 운영자 점검)
    - 선행. T019 · 예상. 0.5h
- [ ] **T022** `README.md` 업데이트 — 환경변수, 실행 방법, 디렉토리 구조 한 문단
    - 선행. P3 완료 · 예상. 0.5h
- [ ] **T023** `flutter analyze`, `flutter test` 통과 확인
    - 선행. 전체 · 예상. 0.5h

## 아키텍처 다이어그램

```
                       +---------------------+
 main()  ───────────▶  | runZonedGuarded     |
                       |  └─ SentryFlutter.init
                       |       (FlutterError + Zone errors)
                       +---------+-----------+
                                 │
                                 ▼
                       +---------------------+
                       |   ProviderScope     |
                       |  (Riverpod root)    |
                       +---------+-----------+
                                 │
                                 ▼
                       +---------------------+
                       | MaterialApp.router  |
                       |   theme: AppTheme   |
                       |   routerConfig:     |
                       |     GoRouter        |
                       +---------+-----------+
                                 │ redirect()
                                 │   ▲
                                 │   │ reads
                                 ▼   │
                       +-----------------------+
                       |  authStateProvider    |
                       +-----------+-----------+
                                   │ token
                                   ▼
 UI ──▶ apiClientProvider ──▶ Dio
                                   │
            +----------------------+----------------------+
            │                      │                      │
            ▼                      ▼                      ▼
   AuthInterceptor       ErrorInterceptor       LoggingInterceptor(dev)
   (JWT 헤더 + refresh)  (상태코드→ApiException) (요청/응답 로그)
            │                      │
            └─────────► Backend (NestJS @ Fly.io) ◄───────┘
```

## 테스트 매트릭스

| #   | 케이스                                   | 입력                                                    | 기대 결과                                                                   |
| --- | ---------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | 정상 부팅                                | 환경변수 모두 설정, 인터넷 정상                         | placeholder home 렌더, Sentry/Crashlytics 정상 초기화 로그                  |
| 2   | 비로그인 사용자 보호 라우트 진입         | authState=signedOut에서 `/closet` deep-link             | `/login`으로 리다이렉트                                                     |
| 3   | 로그인 사용자 `/login` 진입              | authState=signedIn에서 `/login`                         | `/` 홈으로 리다이렉트                                                       |
| 4   | API 200 응답                             | mock `GET /health` 200                                  | 결과 반환, AuthInterceptor가 Authorization 헤더 부착                        |
| 5   | API 401 응답 후 갱신 성공                | 첫 호출 401 → refresh 200 → 재요청 200                  | 호출자에게 최종 200 반환, 갱신 1회만 시도                                   |
| 6   | API 401 응답 후 갱신 실패                | 첫 호출 401 → refresh 401                               | `UnauthorizedException`, authState=signedOut, `/login` 리다이렉트           |
| 7   | API 500 응답                             | mock `GET /x` 500                                       | `ApiException`(serverError) 매핑, Sentry 캡처                               |
| 8   | 네트워크 단절                            | 비행기 모드                                             | `NetworkException` 매핑, UI에서 재시도 가능 메시지                          |
| 9   | 환경변수 누락                            | `API_BASE_URL` 미설정 빌드                              | 부팅 시 명시적 에러 화면, Sentry 캡처                                       |
| 10  | 강제 크래시(Dart 예외)                   | placeholder 버튼 throw                                  | Sentry/Crashlytics 양쪽 대시보드에 수신                                     |
| 11  | 다크 모드 전환                           | OS 다크 모드 토글                                       | ThemeMode.system 반영, 색·타이포 토큰이 다크 팔레트로 전환                  |
| 12  | `flutter analyze` / `flutter test`       | CI 환경                                                 | 에러·경고 0, 기본 테스트 통과                                               |
