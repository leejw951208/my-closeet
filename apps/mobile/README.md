# my_closet_mobile

My Closet 모바일 앱. Flutter 3.41 + Riverpod + go_router + Dio + Sentry.

## 디렉토리 구조

```
lib/
├── app/            # 라우터, 루트 앱, 환경 오류 폴백
├── core/
│   ├── env/        # --dart-define 환경 변수 접근
│   ├── theme/      # Color/Typography/Spacing/Radius/ThemeData
│   ├── network/    # Dio 클라이언트, AuthInterceptor, ErrorInterceptor, ApiException
│   └── logging/    # Logger 인스턴스, Riverpod 옵저버
├── features/
│   └── auth/       # AuthController 스텁(실제 Supabase 연동은 auth-login 슬러그)
└── shared/         # 공통 위젯 자리(현재 비어 있음)
```

## 환경 변수

`--dart-define` 으로 주입한다.

| 키                  | 필수 | 설명                              |
| ------------------- | ---- | --------------------------------- |
| `API_BASE_URL`      | ✅   | NestJS API 베이스 URL             |
| `SENTRY_DSN`        | 권장 | Sentry DSN. 없으면 Sentry 비활성  |
| `SUPABASE_URL`      | -    | Supabase Project URL (auth-login) |
| `SUPABASE_ANON_KEY` | -    | Supabase Anon Key (auth-login)    |
| `APP_ENV`           | -    | `dev` 또는 `prod`. 기본 `dev`     |

## 실행

```bash
flutter pub get
flutter run \
  --dart-define=API_BASE_URL=https://api.example.com \
  --dart-define=SENTRY_DSN=https://...@sentry.io/... \
  --dart-define=APP_ENV=dev
```

`API_BASE_URL` 이 비어 있으면 부팅 시 EnvErrorApp이 누락 키를 안내한다.

## 점검

```bash
flutter analyze
flutter test
```
