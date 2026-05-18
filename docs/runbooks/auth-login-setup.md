<!-- auth-login 슬러그 운영자 셋업 런북. Supabase Auth + 카카오 OAuth + iOS/Android 딥링크 연결. -->

# Runbook. 사용자 로그인 셋업 (Supabase Auth + 카카오)

> 코드는 모두 결선되어 있다. 본 문서는 **콘솔·환경 변수·네이티브 설정** 같은 운영자 단계만 다룬다.
> 적용 슬러그. [docs/features/auth-login/](../features/auth-login/spec.md)
> 적용 일자. 2026-05-18 초판.

---

## 0. 사전 결정

다음 값을 먼저 정한다. 모든 단계에서 이 값을 사용한다.

| 항목 | 권장 값 | 비고 |
| --- | --- | --- |
| Bundle ID / Package | `com.myclosets.app` | iOS·Android 통일. 기존 placeholder에서 본 값으로 마이그레이션 완료. |
| 딥링크 스킴 | `com.myclosets.app://login-callback` | OAuth 콜백이 앱으로 돌아오는 경로. |
| Supabase 프로젝트 | (기존 프로젝트 재사용) | tech-stack 2.2에 따라 Seoul 리전. |
| Supabase 프로젝트 ref | `<your-project-ref>` | 대시보드 URL 또는 Project Settings → General → Reference ID. |

`<your-project-ref>` 는 본인 값으로 치환해 사용한다.

---

## 1. Supabase 콘솔

### 1.1 URL Configuration

대시보드 → **Authentication → URL Configuration**

| 필드 | 값 |
| --- | --- |
| Site URL | `com.myclosets.app://login-callback` |
| Additional Redirect URLs | 같은 값 한 줄 추가 |

### 1.2 Kakao Provider

**Authentication → Providers → Kakao** 카드 클릭.

| 필드 | 값 |
| --- | --- |
| Enable Sign in with Kakao | ON |
| Client ID (for OAuth) | 카카오 콘솔 **REST API 키** |
| Client Secret (for OAuth) | 카카오 콘솔 **보안 → Client Secret** |
| Callback URL (for OAuth) | (자동 표시. 이 값을 카카오 콘솔에 등록할 Redirect URI로 사용) |

저장. **Save** 후 표시되는 Callback URL은 다음 형태다.

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

이 값을 다음 단계(2.5)에서 카카오 콘솔에 입력한다.

### 1.3 API 키 발급 (publishable)

**Project Settings → API Keys**

- **Publishable key** (`sb_publishable_...`) 값을 복사한다. 모바일 `--dart-define=SUPABASE_ANON_KEY` 에 사용.
- 레거시 `anon public` 키는 사용하지 않는다.

⚠️ `secret` 키는 본 슬러그에서 사용하지 않는다. 백엔드는 JWKS로 JWT만 검증한다.

---

## 2. 카카오 콘솔

대상. https://developers.kakao.com → 내 애플리케이션.

본 슬러그는 **비즈앱** 사용을 전제로 한다. 이메일 동의 항목이 비즈앱에서만 활성화되기 때문이다. 비즈앱 전환이 어려우면 일반 앱으로 시작해도 흐름은 동작하며, 사용자 이메일이 null로 들어온다(User 스키마가 nullable).

### 2.1 앱 키 메모

**앱 설정 → 앱 키**

- **REST API 키** 한 줄을 복사한다. Supabase Provider에 입력할 Client ID.

### 2.2 플랫폼 등록

**앱 설정 → 플랫폼**

**Android 등록**

| 필드 | 값 |
| --- | --- |
| 패키지명 | `com.myclosets.app` |
| 스토어 URL | 비워두기 (없음 그대로) |
| 키 해시 | 디버그 키 해시 한 줄 (아래 명령으로 생성) |

```bash
# JDK가 PATH에 없으면 Android Studio 번들 JDK 사용
"/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/keytool" \
  -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore \
  -storepass android -keypass android \
  | openssl sha1 -binary | openssl base64
```

⚠️ 출력된 해시는 **현재 머신의 디버그 빌드** 전용. 다른 Mac/CI/릴리스 키도 각각 추가 등록 필요.

**iOS 등록**

| 필드 | 값 |
| --- | --- |
| 번들 ID | `com.myclosets.app` |
| 앱스토어 ID | 비워두기 |

### 2.3 카카오 로그인 활성화

**제품 설정 → 카카오 로그인**

- 활성화 토글 **ON** → 저장.

### 2.4 OpenID Connect (선택)

같은 페이지의 **OpenID Connect 활성화** 토글.

- 가능하면 ON 권장 (`id_token` 직접 사용).
- 비즈앱이 아니거나 보이지 않으면 OFF로 두어도 동작한다. Supabase가 `access_token` 으로 `/v2/user/me` 호출해 사용자 정보를 받는다.

### 2.5 Redirect URI 등록

**앱 설정 → 앱 키** 페이지의 REST API 키 옆 **수정** 버튼 (또는 동일 화면의 별도 메뉴).

- **카카오 로그인 리다이렉트 URI** 에 1.2에서 확인한 Supabase 콜백 URL 입력.

```
https://<your-project-ref>.supabase.co/auth/v1/callback
```

→ **+** → 저장.

⚠️ 한 글자라도 다르면 `KOE006 mismatching redirect uri` 발생.

### 2.6 동의 항목

**제품 설정 → 카카오 로그인 → 동의 항목**

| 항목 | 동의 단계 | 동의 목적 (사용자 화면에 노출) |
| --- | --- | --- |
| 닉네임 (`profile_nickname`) | 필수 동의 | 서비스 내 사용자 식별 및 표시명으로 사용합니다. |
| 카카오계정(이메일) (`account_email`) | 선택 동의 (비즈앱이면 가능) | 계정 식별과 중요 안내 메일 발송을 위해 사용합니다. |

이메일을 "필수 동의" 로 승급하려면 별도 카카오 검수가 필요하다. 출시 직전 단계에서 신청.

### 2.7 Client Secret 발급

**제품 설정 → 카카오 로그인 → 보안**

- **Client Secret → 코드 생성** → **사용함** → 저장.
- 생성된 값은 **한 번만 보인다.** 안전한 곳에 보관한 뒤 1.2의 Supabase Kakao Provider 화면에 입력.

---

## 3. 백엔드 환경 변수

`apps/api/.env` 에 한 줄 추가 (기존 `DATABASE_URL` 등은 그대로 둔다).

```
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_JWT_AUDIENCE=authenticated
```

`SUPABASE_JWT_AUDIENCE` 는 기본값(`authenticated`)이라 생략해도 동작한다. JWKS URL은 `SUPABASE_URL` 에서 자동 도출되므로 별도 설정 불필요.

검증.

```bash
pnpm --filter @my-closet/api start:dev
# 다른 터미널
curl http://localhost:3000/        # {"status":"ok"} 200
curl -i http://localhost:3000/auth/me   # 401 {code: 'unauthorized'} (Bearer 없음)
```

---

## 4. 모바일 빌드 옵션

```bash
cd apps/mobile

flutter run \
  --dart-define=API_BASE_URL=http://10.0.2.2:3000 \
  --dart-define=SUPABASE_URL=https://<your-project-ref>.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=sb_publishable_<your-key> \
  --dart-define=AUTH_REDIRECT_URI=com.myclosets.app://login-callback
```

| 환경 | `API_BASE_URL` |
| --- | --- |
| Android 에뮬레이터 | `http://10.0.2.2:3000` (에뮬레이터가 호스트 머신에 닿는 경로) |
| iOS 시뮬레이터 | `http://localhost:3000` |
| 실제 디바이스 (같은 LAN) | `http://<host-LAN-IP>:3000` |

`SUPABASE_ANON_KEY` 변수명은 그대로 두고 값만 `sb_publishable_...` 형태로 넣는다 (supabase_flutter SDK가 publishable 키도 같은 슬롯에서 받음).

---

## 5. 네이티브 설정 (코드 반영 완료)

다음 변경은 본 슬러그에서 이미 코드에 반영되어 있다. 콘솔 작업과 별개로 동작 확인용 참고.

| 파일 | 변경 내용 |
| --- | --- |
| `apps/mobile/android/app/build.gradle.kts` | `applicationId = "com.myclosets.app"` |
| `apps/mobile/android/app/src/main/AndroidManifest.xml` | `com.myclosets.app://login-callback` intent-filter 추가 |
| `apps/mobile/ios/Runner.xcodeproj/project.pbxproj` | `PRODUCT_BUNDLE_IDENTIFIER` = `com.myclosets.app` (6곳) |
| `apps/mobile/ios/Runner/Info.plist` | `CFBundleURLTypes` 에 `com.myclosets.app` URL Scheme |

릴리스 빌드용 키스토어를 만들 때는 그 키 해시도 카카오 콘솔 2.2에 추가 등록해야 한다.

iOS Universal Link(브라우저에서 직접 앱으로 라우팅)를 쓰려면 Xcode에서 **Signing & Capabilities → Associated Domains** 에 `applinks:<your-project-ref>.supabase.co` 추가. 현재 흐름(스킴 딥링크)만으로도 동작한다.

---

## 6. 수동 검증 시나리오

| # | 시나리오 | 기대 결과 |
| --- | --- | --- |
| 1 | 로그인 화면 → 약관 동의 체크 → 카카오 버튼 | 카카오 동의 화면 노출 |
| 2 | 카카오 동의 후 콜백 | 앱으로 복귀, 홈 placeholder 표시 |
| 3 | 백엔드 로그 | `POST /auth/sync 200` 라인 |
| 4 | 약관 미동의 상태에서 버튼 | 비활성 (탭 무반응) |
| 5 | 앱 강제 종료 → 재실행 | 스플래시 → 자동 signedIn → 홈 |
| 6 | 보호 라우트(`/closet` 등) 직접 진입 (로그아웃 상태) | `/login` 리다이렉트 |

---

## 7. 자주 막히는 곳

| 증상 | 원인 / 조치 |
| --- | --- |
| `KOE006 mismatching redirect uri` | 2.5 카카오 Redirect URI ≠ Supabase 콜백 URL. 정확히 같은 문자열로. |
| `KOE205 not registered platform key hash` | 2.2 Android 키 해시 누락 / 잘못된 머신 해시. |
| 카카오 동의 후 앱으로 안 돌아옴 | iOS plist URL Scheme / Android intent-filter 누락 (5장 코드 반영 확인). |
| 동의 화면에서 이메일 항목 안 보임 | 일반 앱에서는 이메일 동의 비활성. 비즈앱 전환 또는 닉네임만으로 시작. |
| `provider_not_enabled` (Supabase) | 1.2에서 Kakao Enable OFF 상태. |
| `Invalid or expired token` (백엔드 401) | JWKS 캐시 만료 직전 / 토큰 만료. 모바일 `AuthInterceptor` 가 자동 refresh 후 재시도. |
| `EnvErrorApp` 화면 표시 | 모바일 `--dart-define` 누락. `API_BASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` 모두 필요. |

---

## 8. 향후 작업

| 작업 | 위치 |
| --- | --- |
| 애플 OAuth 등록 | 본 문서에 §9로 추가 예정. |
| 비즈앱 검수 (이메일 필수 동의) | 출시 직전. |
| 릴리스 키스토어 + 키 해시 등록 | 출시 직전. |
| iOS Universal Link | 도메인 확보 후. |
| Apple Developer Team ID 입력 (카카오 콘솔 iOS 플랫폼) | Apple 등록과 함께. |
