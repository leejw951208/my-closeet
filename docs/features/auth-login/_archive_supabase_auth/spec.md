<!-- 사용자 로그인 기능 사양. Supabase Auth(카카오/애플/이메일) + NestJS JWT 검증 + Flutter 로그인 화면. -->

# Spec. 사용자 로그인 (Auth Login)

> 한 줄 요약. Supabase Auth로 카카오·애플·이메일 로그인을 수행하고, 발급된 JWT로 NestJS 보호 라우트와 모바일 인증 상태를 결선한다.

## 배경

My Closet은 사용자별 옷장·코디·캘린더 데이터를 격리해야 한다. 그러려면 모든 보호 API와 모바일 화면이 동일한 사용자 식별 체계를 공유해야 한다.

tech-stack.md 2.2/2.5 결정에 따라 인증은 Supabase Auth가 OAuth(카카오·애플)·이메일 흐름과 JWT 발급을 전담하고, NestJS는 발급된 JWT를 검증해 `userId` 만 추출한다. 자체 OAuth 흐름이나 세션 관리는 만들지 않는다. 50k MAU 도달 또는 커스텀 세션 요구가 생기는 시점에 자체 Auth 이관을 재평가한다.

PRD US-01("앱을 처음 켰을 때 30초 안에 옷장을 시작할 수 있다") 기준으로, 첫 로그인 직후 도메인 `User` 와 빈 `Closet` 이 자동으로 준비되어야 옷 등록 화면으로 매끄럽게 진입할 수 있다. mobile-foundation 슬러그에서 `AuthController` 스텁·`SecureTokenStorage` 인터페이스·`apiClientProvider` 가 이미 준비되어 있으므로, 본 슬러그는 그 스텁 자리를 실제 Supabase 흐름으로 대체하는 작업이다.

## 기능 목록

### 모바일 로그인 화면

Supabase Flutter SDK를 사용해 카카오·애플·이메일 로그인 UI를 제공하고, 성공 시 `AuthController` 를 `signedIn` 으로 전이시킨다.

**동작 방식**

- `/login` 라우트가 첫 진입 시 약관 + 만 14세 이상 동의 체크박스를 노출한다.
- 카카오/애플 버튼은 `supabase_flutter` 의 `signInWithOAuth(Provider.kakao | apple)` 를 호출하고 딥링크 콜백을 받는다.
- 이메일 버튼은 매직 링크(OTP) 흐름을 사용한다(비밀번호 없음).
- 로그인 성공 시 `accessToken`/`refreshToken` 을 `SecureTokenStorage` 에 저장하고 `AuthController.signIn` 호출.
- 로그아웃은 설정 화면에서 호출되며 토큰 폐기 + Supabase `signOut` + storage clear.

**포함 범위**

- 카카오·애플·이메일 매직링크 진입 3종
- 약관·14세 동의 체크
- 토큰 영속화 + 앱 재시작 시 자동 복구
- 토큰 만료 시 `refreshToken` 사용한 무중단 갱신(Dio AuthInterceptor와 결선)

**제외 범위**

- 이메일·비밀번호 가입. 매직링크로 대체. 이유는 비밀번호 자체 관리 비용 회피.
- 회원 탈퇴 화면. PRD 후속 단계 범위.
- 다중 디바이스 강제 로그아웃. v1.5 푸시 도입 시 함께 설계.

### 백엔드 JWT 검증 가드

NestJS 의 모든 보호 라우트에 적용되는 `AuthGuard` 와 `@CurrentUser()` 데코레이터를 제공한다.

**동작 방식**

- 글로벌 `AuthGuard` 가 `Authorization: Bearer <jwt>` 헤더에서 토큰을 읽는다.
- Supabase 공개키(JWKS) 로 서명·만료·issuer·audience 검증.
- 검증 통과 시 `req.user = { id, email, provider }` 부착.
- 검증 실패 시 401 + 코드 `unauthorized`.
- `@Public()` 데코레이터로 화이트리스트 라우트(`/health`, `/auth/sync`) 표시.
- `@CurrentUser()` 데코레이터로 컨트롤러에서 user를 받는다.

**포함 범위**

- JWKS 캐시(5분 TTL) + 시계 스큐 60초 허용
- 401 응답 페이로드 `{ code, message }` 표준화
- 모든 신규 컨트롤러 기본 보호 + 명시적 화이트리스트

**제외 범위**

- 권한(RBAC). 본 슬러그는 인증만, 인가는 후속 슬러그.
- 세션 무효화 블랙리스트. Supabase가 토큰 만료를 관리.

### 사용자·옷장 자동 동기화

Supabase Auth 사용자가 처음 토큰을 가져오는 시점에 NestJS가 도메인 `User` + 빈 `Closet` 을 lazy 생성한다.

**동작 방식**

- 모바일이 로그인 직후 `POST /auth/sync` 호출(idempotent).
- 백엔드는 JWT에서 `sub`(Supabase user id), `email`, `provider` 추출.
- `User.id` 는 Supabase `sub` UUID를 그대로 사용한다(매핑 테이블 불필요).
- `prisma.user.upsert` + 동일 트랜잭션 내 `Closet` 부재 시 생성.
- 응답으로 `{ user: { id, email, provider, closetId } }` 반환.

**포함 범위**

- 신규 사용자 첫 호출 시 User + Closet 동시 생성
- 기존 사용자는 메타데이터 갱신(email 변경 등)만
- 단일 트랜잭션 + 멱등성(중복 호출 안전)

**제외 범위**

- Supabase Auth Webhook 수신. 단순한 lazy 동기화로 충분하고 운영 부담이 작다.
- 프로필 사진·닉네임. 본 슬러그에서는 인증 최소 정보만.

## 입출력

**입력**

- 모바일. 사용자 OAuth 동의 + 매직링크 클릭. 환경변수 `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- 백엔드. `Authorization: Bearer <jwt>` 헤더. 환경변수 `SUPABASE_URL`, `SUPABASE_JWT_SECRET` 또는 `SUPABASE_JWKS_URL`.

**출력**

- 모바일. `AuthController` 상태가 `signedIn` 으로 전이하고 보호 라우트 진입 가능.
- 백엔드. 보호 컨트롤러에서 `req.user.id` 사용 가능. `POST /auth/sync` 응답으로 `{ user: { id, email, provider, closetId } }`.

## 제약 조건

- Supabase Auth Seoul 리전. 50k MAU 무료 한도.
- 모바일은 mobile-foundation의 `SecureTokenStorage`·`apiClientProvider`·`authControllerProvider` 인터페이스를 그대로 사용한다.
- 백엔드는 `apps/api/src/auth/` 아래에 모듈을 추가하고 `app.module.ts` 에 글로벌 가드로 등록한다.
- iOS 카카오 OAuth는 Universal Link, Android는 Custom Scheme. 딥링크 충돌 방지 위해 `com.myclosets.app://login-callback` 통일.
- 만 14세 미만은 가입 차단(동의 화면 통과 불가).

## 예외 케이스

- OAuth 사용자가 동의 취소 → "로그인 취소됨" 토스트, 로그인 화면 유지.
- 네트워크 단절 → 재시도 가능 메시지. 로컬에 partial 상태 저장 안 함.
- JWT 서명 검증 실패 → 401 `unauthorized`, 모바일은 `signedOut` 전이 + `/login` 리다이렉트.
- JWKS 조회 실패 → 캐시된 키 사용, 캐시도 없으면 503 후 Sentry 캡처.
- `POST /auth/sync` 가 중복 호출 → idempotent (upsert) 로 200 반환.
- Supabase 사용자 메일 변경 → 다음 sync 호출에서 도메인 User.email 도 갱신.
- 14세 동의 체크 안 함 → 로그인 버튼 비활성화.

## 채택 근거

**핵심 이유**

- Supabase Auth가 카카오·애플·이메일 흐름과 JWT 발급을 모두 관리 → 자체 OAuth 구현 1~2주 + 보안 부담 절감.

**보조 이유**

- Postgres와 동일 벤더로 RLS 통합 가능(v1.5).
- NestJS는 JWT 검증만 책임지므로 변경 표면이 작고 테스트가 단순.
- Lazy `auth/sync` 는 Webhook 운영 부담을 피하면서 첫 호출 시 보장된 User/Closet 을 제공.

**기각된 대안**

- Firebase Auth. Postgres와 분리되어 통합 비용 증가. tech-stack 2.2에서 탈락.
- 자체 OAuth (Passport 카카오/애플 전략). 구현·유지 비용 대비 가치 낮음.
- Auth 동기화를 Supabase Webhook 으로. 운영 복잡도 증가, 멱등성 보장도 추가 작업 필요. lazy upsert가 단순.

## 비기능 요건

**성능**

- 로그인 화면 → 홈 진입까지 OAuth 왕복 포함 5초 이내(국내 4G 기준).
- `AuthGuard` 토큰 검증 오버헤드. 요청당 1ms 미만(JWKS 캐시 적중 시).

**보안**

- 위협 모델. 도용된 JWT 재사용 차단(만료·서명 검증), 단말 탈취 시 토큰 노출 최소화.
- 토큰 저장. `flutter_secure_storage`(iOS Keychain, Android EncryptedSharedPreferences) 사용. plaintext SharedPreferences 금지.
- 백엔드 로그·Sentry payload에서 `Authorization` 헤더와 JWT 본문 마스킹(mobile-foundation pii_filter 와 동일 정책 백엔드 적용).
- HTTPS 강제. 평문 HTTP 콜백 불허.

**확장성**

- 가정 규모. MAU 50k 까지 Supabase 무료 한도로 운영.
- 그 이상은 Supabase Pro($25/월) 또는 자체 Auth 이관 재평가.

## 용어 정의

- **JWT.** Supabase Auth가 발급하는 서명된 JSON Web Token. 사용자 식별·만료·provider 정보를 담는다.
- **JWKS.** JSON Web Key Set. Supabase가 공개키를 게시하는 엔드포인트로 서명 검증에 사용.
- **Magic Link.** 이메일로 전송되는 단발 로그인 URL. 비밀번호 대체.
- **AuthGuard.** NestJS에서 컨트롤러 진입 전 요청을 검증하는 가드.
- **lazy 동기화.** 첫 보호 호출 시점에 도메인 객체를 만드는 방식. Webhook 비의존.
