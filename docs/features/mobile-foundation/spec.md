<!-- My Closet 모바일 앱의 기초 인프라(디자인 시스템·라우팅·상태관리·API 클라이언트·크래시 리포팅) 사양 문서. -->

# Spec. 모바일 기초 인프라 (Mobile Foundation)

> 한 줄 요약. 이후 모든 모바일 기능이 의존하는 디자인 시스템·라우팅·상태관리·API 클라이언트·크래시 리포팅의 공통 토대를 한 번에 마련한다.

## 배경

My Closet 모바일은 Flutter 3.41 기반으로 출발했으나 현재 `apps/mobile`은 `flutter create` 직후 상태에 가깝다. `pubspec.yaml`에 `flutter_riverpod`, `go_router`, `http` 의존성만 선언되어 있을 뿐 디자인 토큰·라우팅 트리·상태 컨테이너·HTTP 클라이언트·에러 모니터링은 모두 비어 있다.

Phase 2(등록 흐름)부터는 카메라/갤러리, 멀티 업로드, AI 결과 화면, 옷장 일람 등 다수의 화면이 동시에 진입한다. 그 시점에 라우팅·테마·HTTP를 즉흥적으로 갖추면 화면마다 스타일이 갈리고, 토큰 갱신·에러 매핑이 중복 구현되며, 크래시 발생 시 원인 추적이 어렵다.

따라서 Phase 1(Week 1~3)에 디자인 시스템·라우팅 골격·Riverpod 베이스·Dio 기반 API 클라이언트·Sentry/Crashlytics 연동을 일괄 정비해, 이후 모든 기능 슬러그가 동일한 토대 위에서 화면 한 장만 추가하면 동작하도록 만든다.

## 기능 목록

### 디자인 시스템

테마(ColorScheme, Typography, Spacing, Radius)를 토큰으로 정의하고 `ThemeData`로 노출한다. 모든 화면은 토큰을 통해서만 스타일을 참조한다.

**동작 방식**

- `lib/core/theme/` 에 `app_colors.dart`, `app_typography.dart`, `app_spacing.dart`, `app_theme.dart` 분리
- `MaterialApp.router`에 `theme`/`darkTheme` 주입
- 위젯은 `Theme.of(context)` 또는 익스텐션으로 접근

**포함 범위**

- 라이트/다크 ColorScheme
- 본문/제목/캡션 Typography 스케일
- 4·8·16·24·32 Spacing 토큰
- 8·12·16·24 Radius 토큰

**제외 범위**

- 컴포넌트 라이브러리(Button/Card 위젯 추상화). 이유는 화면별 변형이 굳어진 뒤 추출하는 편이 안전하다.

### 라우팅 골격

go_router 기반 라우트 트리를 선언적으로 정의하고 인증 상태에 따라 리다이렉트한다.

**동작 방식**

- `lib/app/router.dart` 에서 `GoRouter` 인스턴스 생성
- 라우트 경로 `/login`, `/`(home), `/register`, `/closet`, `/outfit`, `/calendar`
- `redirect` 콜백이 auth provider 상태를 읽어 비로그인 시 `/login`으로 보냄
- 라우트 이름 상수는 `AppRoute` enum으로 노출

**포함 범위**

- 6개 최상위 라우트 셸과 빈 placeholder 화면
- 인증 기반 리다이렉트
- 라우트 enum + 헬퍼

**제외 범위**

- 중첩 셸 라우트, 탭 네비게이션 디테일. 이유는 IA 확정 전 과도한 구조화는 변경 비용만 크다.

### Riverpod 상태 관리 베이스

Riverpod 2 기반의 전역 Provider 컨테이너를 구성하고 인증 상태·API 클라이언트를 주입한다.

**동작 방식**

- `main()`에서 `ProviderScope` 로 앱 감싸기
- `authStateProvider` (Supabase 세션 → `AuthState` enum)
- `apiClientProvider` (아래 API 클라이언트 의존)
- `Logger` 옵저버 등록(개발 빌드만)

**포함 범위**

- ProviderScope 설정과 옵저버
- 인증 상태/사용자 정보 Provider 인터페이스(실제 Supabase 연결은 `auth-login` 슬러그에서 구현)
- API 클라이언트 Provider

**제외 범위**

- 도메인 Provider(items, outfits 등). 각 기능 슬러그에서 추가한다.

### API 클라이언트

Dio 기반 HTTP 클라이언트에 인터셉터(JWT 헤더, 토큰 갱신, 에러 매핑)를 장착한다.

**동작 방식**

- `lib/core/network/api_client.dart`
- BaseOptions에 baseUrl·timeout·기본 헤더
- AuthInterceptor가 `authStateProvider`에서 JWT 읽어 Authorization 헤더 추가
- ErrorInterceptor가 HTTP 상태코드와 백엔드 에러 페이로드를 도메인 `ApiException`으로 매핑
- 401 수신 시 1회 한해 토큰 갱신 시도 후 재요청

**포함 범위**

- Dio 인스턴스 팩토리
- AuthInterceptor / ErrorInterceptor / LoggingInterceptor(dev)
- `ApiException`, `NetworkException`, `UnauthorizedException`

**제외 범위**

- 응답 모델 직렬화 코드젠. 기능 슬러그가 도입 시점에 결정.

### 크래시 리포팅

Sentry Flutter를 초기화해 Flutter/Native 양쪽 크래시를 수집한다. tech-stack.md 2.6 결정에 따라 Firebase Crashlytics는 채택하지 않는다(Sentry 단일 organization으로 모바일↔백엔드 trace 자동 연결, Crashlytics는 Node.js SDK 부재로 백엔드 분리가 필요).

**동작 방식**

- `main()` 진입 시 `SentryFlutter.init` 으로 `FlutterError.onError` 라우팅
- `runZonedGuarded`로 비동기 예외 캡처
- 빌드 모드별 DSN 분리(`--dart-define`)
- 정상 흐름 401/404는 `beforeSend`에서 필터, 이메일·Bearer 토큰은 마스킹

**포함 범위**

- Sentry 초기화·tracesSampleRate 0.1
- Sentry beforeSend PII 마스킹
- 환경변수 로딩 메커니즘

**제외 범위**

- Replay·Session Tracking. 이유는 비용·프라이버시 검토 필요.

## 입출력

**입력**

- 환경변수. `API_BASE_URL` (String, URL), `SENTRY_DSN` (String, URL), `SUPABASE_URL`/`SUPABASE_ANON_KEY` (String). `--dart-define` 또는 `.env`(`flutter_dotenv`)로 주입.

**출력**

- 앱 구동 시점에 `MaterialApp.router`가 라우팅·테마·ProviderScope가 결합된 상태로 렌더링되며, 모든 후속 기능 슬러그가 `apiClientProvider` / `Theme.of(context)` / `AppRoute`만 사용해 화면을 추가할 수 있는 상태가 된다.

## 제약 조건

- Flutter SDK `>=3.41.0`, Dart `>=3.5.0` 유지.
- 무료 티어 도구 우선(Sentry 5k events/월, Crashlytics 무료).
- 모노레포 `apps/mobile` 경로 안에서 완결. 백엔드 변경 없음.
- iOS 14+, Android 8.0(API 26)+ 지원 가정.

## 예외 케이스

- API_BASE_URL 미설정 → 부팅 시 명시적 에러 페이지 표시(앱 무한 로딩 금지).
- Sentry/Crashlytics 초기화 실패 → 로깅 후 앱 부팅은 계속 진행.
- 401 응답·토큰 갱신 실패 → `authStateProvider`를 `signedOut`으로 전이하고 `/login` 리다이렉트.
- 네트워크 단절 → `NetworkException` 통일된 메시지로 UI 노출.
- 다크 모드 OS 설정 → ThemeMode.system 적용.

## 채택 근거

**핵심 이유**

- Phase 2 이후 동시에 진입하는 다수 화면이 동일한 토대를 공유해야 일관성·속도·안정성을 모두 확보할 수 있다.

**보조 이유**

- 라우팅·인증 리다이렉트를 한곳에 두면 각 화면이 인증 처리를 중복 구현하지 않는다.
- API 인터셉터에 토큰 갱신·에러 매핑을 묶으면 화면 코드가 비즈니스 로직에 집중한다.
- Sentry+Crashlytics 조기 설치는 초기 베타에서 원인 추적 비용을 크게 낮춘다.

**기각된 대안**

- BLoC. Riverpod이 1인 풀스택 기준 보일러플레이트가 적고 PRD 단계 규모에 충분하다.
- Navigator 2.0 직접 구현. go_router가 동등 기능을 더 적은 코드로 제공한다.
- http 패키지 단독 사용. 인터셉터·재시도·에러 매핑 표준이 부족해 Dio가 더 적합하다.
- Crashlytics 병행. tech-stack.md 2.6에 따라 Sentry 단일 organization로 모바일·백엔드를 통합한다. Crashlytics는 Node.js SDK가 없어 백엔드를 별도 관리해야 하므로 채택하지 않는다.

## 비기능 요건

**성능**

- 콜드 스타트 to first frame. 중급 안드로이드 단말에서 2.0초 이내(Sentry/Crashlytics 초기화 포함).
- API 인터셉터 오버헤드. 요청당 5ms 미만.

**보안**

- 위협 모델. 단말 탈취 시 토큰 유출 방지. JWT는 `flutter_secure_storage`에 저장(이번 슬러그는 인터페이스만, 실제 저장은 `auth-login`에서).
- 로그·Sentry payload에서 PII(이메일·토큰) 필터.

**확장성**

- 가정 규모. MAU 15k 까지 단일 클라이언트 빌드로 운영. 그 이상은 flavor 분리(`prod`/`staging`)로 대응.

## 용어 정의

- **Provider.** Riverpod에서 상태/객체를 노출하는 단위.
- **Interceptor.** Dio 요청·응답·에러를 가로채는 미들웨어.
- **ThemeData.** Flutter에서 색·타이포·여백 등 시각 토큰을 묶은 객체.
- **DSN.** Sentry 프로젝트 식별·전송 엔드포인트 문자열.
