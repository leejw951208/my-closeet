# my_closet_mobile

My Closet 모바일 앱. Flutter 3.41 + Riverpod + go_router + Dio + Sentry + Supabase Auth.

## 디렉토리 구조

```
lib/
├── app/            # 라우터, 루트 앱, 환경 오류 폴백
├── core/
│   ├── env/        # --dart-define 환경 변수 접근
│   ├── theme/      # Color/Typography/Spacing/Radius/ThemeData
│   ├── network/    # Dio 클라이언트, AuthInterceptor, ErrorInterceptor, ApiException
│   ├── storage/    # SecureTokenStorage 인터페이스 + flutter_secure_storage 구현
│   └── logging/    # Logger 인스턴스, PII 필터, Riverpod 옵저버
├── features/
│   └── auth/       # AuthController, SupabaseAuthController, LoginScreen, /auth/sync repo
└── shared/         # 공통 위젯 자리(현재 비어 있음)
```

## Bundle ID / Package

`com.myclosets.app` (iOS·Android 통일). 변경 시 카카오/애플 콘솔의 플랫폼 등록도 같이 갱신.

## 환경 변수

`--dart-define` 으로 주입한다.

| 키                   | 필수            | 설명                                                    |
| -------------------- | --------------- | ------------------------------------------------------- |
| `API_BASE_URL`       | ✅              | NestJS API 베이스 URL                                   |
| `SUPABASE_URL`       | ✅              | Supabase Project URL                                    |
| `SUPABASE_ANON_KEY`  | ✅              | Supabase Anon Key                                       |
| `AUTH_REDIRECT_URI`  | -               | OAuth 콜백 딥링크. 기본 `com.myclosets.app://login-callback` |
| `SENTRY_DSN`         | prod에서 필수  | Sentry DSN. 없으면 Sentry 비활성                        |
| `APP_ENV`            | -               | `dev` 또는 `prod`. 기본 `dev`                           |

## 실행 (dev)

```bash
flutter pub get
flutter run \
  --dart-define=API_BASE_URL=http://localhost:3000 \
  --dart-define=SUPABASE_URL=https://gjfapqiwyvrmquufwzcs.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=<anon-public-key> \
  --dart-define=AUTH_REDIRECT_URI=com.myclosets.app://login-callback
```

필수 키 누락 시 부팅 시 EnvErrorApp이 안내한다.

## 점검

```bash
flutter analyze
flutter test
```

## 인증 흐름 (dev)

1. `/login` 진입 → 약관 동의 체크 → 카카오/애플/이메일 버튼 활성
2. 카카오 버튼 → 카카오 로그인 → Supabase 콜백 → 앱 복귀 → `signedIn`
3. `apiClientProvider` 가 JWT 자동 부착 → `POST /auth/sync` 가 User/Closet 보장
4. 401 발생 시 `AuthInterceptor` 가 single-flight refresh 후 재시도, 실패 시 `signedOut`
