<!-- 사용자 로그인 기능 명세. SMS OTP + PIN + 생체인식 기반 자체 인증 시스템. -->

# Spec. 사용자 로그인 (SMS + PIN + 생체인식)

> 한 줄 요약. 휴대폰 번호 SMS 인증으로 가입하고, 평소엔 PIN 6자리 또는 생체인식으로 1초 만에 들어가는 마찰 없는 로그인 시스템.

## 배경

기존 슬러그는 Supabase Auth 위에 카카오·애플·이메일 매직링크 OAuth를 얹은 구조였다. 그러나 옷장 앱은 본질적으로 **1인용·로컬 중심**이라 OAuth provider 셋업 비용(카카오 디벨로퍼스 등록, Apple Service ID, 딥링크 associated domain)과 사용자 마찰(매 로그인마다 외부 브라우저 왕복)이 가치 대비 과하다는 결론에 도달했다.

또한 Supabase Auth를 떼고 나면 Supabase의 잔여 가치는 관리형 Postgres뿐인데, 서울 리전을 제공하는 거의 유일한 무료 옵션이라 DB만은 그대로 유지한다. 인증은 **자체 구현**으로 가져가서 SMS 발송 비용(솔라피 건당 8원, Twilio 대비 8배 저렴)과 사용자 경험(토스·당근 방식의 익숙한 흐름)을 모두 잡는다.

복구 정책은 의도적으로 단순화했다. "번호 = 계정"이라는 모델을 깨지 않고, 번호 변경 전 기기를 잃은 사용자는 복구 불가로 일관 응대한다. 예외를 만들면 본인확인 서비스(PASS) 연동·CS 운영 비용이 기하급수로 늘어난다.

## 기능 목록

### 회원가입

휴대폰 번호로 SMS 인증을 거쳐 계정을 만들고, PIN 6자리를 등록한 뒤 선택적으로 생체인식을 활성화한다. 이메일·소셜 계정·약관 페이지를 거치지 않고 3개 화면(번호 입력 → OTP 입력 → PIN 설정)으로 완료된다.

**동작 방식**

- 번호 입력 화면에서 휴대폰 번호(+82 고정) 입력 → "인증번호 받기"
- 백엔드가 6자리 OTP를 생성, 솔라피로 SMS 발송, OTP 해시를 5분 TTL로 Redis(또는 Postgres)에 저장
- OTP 입력 화면에서 사용자가 6자리 입력 → 백엔드 검증 → 신규 번호면 user 생성 + closet 생성 (트랜잭션)
- PIN 설정 화면에서 6자리 입력 + 확인 입력 → 백엔드가 bcrypt(cost 12)로 해시 후 저장
- 생체인식 등록 동의 화면 (선택, 건너뛰기 허용)
- 온보딩 강한 고지 화면 — "휴대폰 번호가 곧 계정입니다. 번호 변경 시 반드시 앱에서 먼저 변경해주세요. 그렇지 않으면 옷장 데이터를 복구할 수 없습니다." + 동의 체크박스
- 가입 완료 → JWT(access 30분 + refresh 30일) 발급 → 홈 화면

**포함 범위**

- 휴대폰 번호 정규화·검증(`+82` 고정, 10~11자리 숫자)
- OTP 5분 TTL, 발송 1분 쿨다운, 동일 번호 1시간 내 5회 제한
- PIN 6자리 숫자, 단순 패턴(`111111`, `123456`) 거부
- 생체인식 등록은 선택, 건너뛰어도 가입 완료
- 디바이스 식별자(uuid) 발급 후 SecureStorage에 저장 (세션 식별용)

**제외 범위**

- 약관·개인정보처리방침 페이지. 이유는 별도 슬러그(`legal-pages`)에서 처리.
- 14세 미만 확인. 이유는 MVP 범위 외, 관련 법령 검토 후 별도 슬러그.
- 비밀번호 복잡도 정책(영문·특수문자). 이유는 PIN은 6자리 숫자가 표준 UX.

### 로그인 (재방문 시)

앱을 다시 열었을 때 생체인식 또는 PIN 6자리로 1초 만에 진입한다. 외부 브라우저 왕복 없음, SMS 인증 없음.

**동작 방식**

- 앱 부팅 → SecureStorage에서 refresh token 조회
- refresh token 있으면 백엔드로 `/auth/refresh` 호출 → 새 access token 발급
- 생체인식 등록되어 있으면 LocalAuth 호출 → 성공 시 홈 화면
- 생체인식 미등록·실패 시 PIN 입력 화면
- PIN 6자리 입력 → 백엔드 `/auth/pin/verify` → 성공 시 홈 화면

**포함 범위**

- 생체인식 우선, 실패·취소 시 PIN으로 fallback
- PIN 실패 3회 연속 시 "번호 바꾸셨나요? SMS 재인증으로 PIN 재설정" 안내 화면 노출
- PIN 실패 5회 연속 시 10분 잠금 (잠금 해제는 SMS 재인증)
- access token 만료(30분)는 자동 refresh

**제외 범위**

- "PIN 찾기" 별도 플로우. 이유는 SMS 재인증으로 PIN 재설정이 곧 PIN 찾기.

### PIN 재설정

PIN을 잊었거나 잠금에 걸린 사용자가 SMS 재인증으로 PIN을 새로 설정한다.

**동작 방식**

- PIN 입력 화면 하단 "PIN을 잊으셨나요?" → SMS 재인증 화면
- 등록된 번호로 OTP 발송 → 6자리 입력 → 검증
- 새 PIN 6자리 설정 → 기존 PIN 해시 덮어쓰기
- 잠금 카운터 초기화, 새 JWT 발급, 홈 화면

**포함 범위**

- PIN 재설정 후에도 옷장 데이터는 그대로 (계정 ID 불변)
- 재설정 이력 로그 (`pin_reset_log` 테이블, 감사용)

**제외 범위**

- 이전 PIN 입력 요구. 이유는 잊은 PIN을 다시 묻는 건 의미 없음.

### 휴대폰 번호 변경

번호가 바뀌었을 때 앱 내 설정에서 새 번호로 갱신한다.

**동작 방식**

- 설정 → "휴대폰 번호 변경" → 현재 번호 SMS 인증 → 새 번호 입력 → 새 번호 SMS 인증 → 갱신
- 새 번호가 다른 계정에 이미 등록되어 있으면 거부 (한 번호 = 한 계정)
- 갱신 완료 후 모든 기존 refresh token 무효화 (재로그인 강제)

**포함 범위**

- 구 번호·신 번호 양쪽 인증으로 도용 방지
- 변경 이력 로그 (`phone_change_log` 테이블, 감사용)

**제외 범위**

- 통신사 본인확인(PASS) 연동. 이유는 비용·복잡도 과다, MVP 범위 외.

### 간접 신호 안내

번호 변경을 잊은 사용자를 코드 감지 없이 UX로 유도한다.

**동작 방식**

- 마지막 활동 30일 경과 후 첫 진입 시 홈 화면 상단 배너 — "오랜만이네요. 번호 바꾸셨다면 설정에서 먼저 변경해주세요. 안 하면 데이터 복구가 어려워요."
- PIN 3회 연속 실패 시 안내 모달 — "번호 바꾸셨나요? SMS 재인증으로 PIN을 다시 설정할 수 있어요."
- 온보딩 시 강한 고지 (위 회원가입 항목 참조)

**포함 범위**

- 배너는 사용자가 닫으면 그날은 다시 안 뜸 (하루 1회)
- 안내 모달의 "SMS 재인증" 버튼은 PIN 재설정 플로우로 직접 연결

**제외 범위**

- SIM 카드 변경 감지. 이유는 안드로이드만 가능하고 권한 거부감, iOS와 UX 통일 위해 간접 신호로만.

### 로그아웃

설정에서 로그아웃하면 SecureStorage의 토큰을 지우고 서버 refresh token도 무효화한다.

**동작 방식**

- 설정 → "로그아웃" → 확인 모달 → 백엔드 `/auth/logout` 호출
- SecureStorage 비움 → 로그인 화면으로 이동
- 로그아웃 후 재진입은 PIN 또는 SMS 재인증 (생체인식만으론 안 됨, 토큰이 사라졌으므로)

**포함 범위**

- 단일 디바이스 로그아웃 (해당 기기의 refresh token만 무효화)

**제외 범위**

- "모든 기기에서 로그아웃". 이유는 MVP는 1인 1기기 가정, 추후 멀티 디바이스 슬러그에서.

## 입출력

### 백엔드 REST API

**POST /auth/otp/send**

- 입력. `{ phoneNumber: string }` (E.164 형식, `+82` 시작)
- 출력. `{ requestId: string, expiresInSec: 300 }` 또는 4xx (쿨다운·리밋 위반)

**POST /auth/otp/verify**

- 입력. `{ requestId: string, code: string }` (6자리 숫자)
- 출력 (신규 가입 진입). `{ otpSessionToken: string, isNewUser: true }` — PIN 설정 단계로 진입할 5분 토큰
- 출력 (기존 사용자). `{ otpSessionToken: string, isNewUser: false }`
    - `purpose=SIGNUP` 이면 모바일은 중복 가입을 시도하지 않고 해당 번호를 마지막 로그인 번호로 저장한 뒤 PIN 로그인 화면으로 보낸다.
    - `purpose=RESET` 이면 모바일은 PIN 재설정의 새 PIN 설정 단계로 보낸다.

**POST /auth/signup/complete**

- 입력. `{ otpSessionToken: string, pin: string }` (PIN 6자리)
- 출력. `{ accessToken, refreshToken, user: { id, phoneNumber } }`

**POST /auth/pin/verify**

- 입력. `{ userId: string, pin: string }` (또는 access token으로 본인 식별)
- 출력 성공. `{ accessToken, refreshToken }`
- 출력 실패. `{ remainingAttempts: number }` 또는 423 Locked

**POST /auth/pin/reset**

- 입력. `{ otpSessionToken: string, newPin: string }`
- 출력. `{ accessToken, refreshToken }`

**POST /auth/refresh**

- 입력. `{ refreshToken: string }`
- 출력. `{ accessToken, refreshToken }` (refresh token도 회전)

**POST /auth/phone/change**

- 입력. `{ currentOtpSessionToken, newPhoneNumber }` (현재 번호 인증 후 새 번호 OTP 따로 요청·검증한 결과로 묶어 호출)
- 출력. `{ user: { id, phoneNumber } }`

**POST /auth/logout**

- 입력. Bearer access token, `{ refreshToken }`
- 출력. 204 No Content

**GET /auth/me**

- 입력. Bearer access token
- 출력. `{ id, phoneNumber, createdAt, lastSignInAt }`

### Postgres 스키마 (Prisma)

- `User { id Uuid, phoneNumber String @unique, pinHash String, pinFailedCount Int, pinLockedUntil DateTime?, lastSignInAt DateTime?, createdAt, updatedAt }`
- `RefreshToken { id, userId, lookupKey String @unique, tokenHash String, deviceId, expiresAt, revokedAt, createdAt }`
- `OtpRequest { id, phoneNumber, codeHash (HMAC), purpose Enum(SIGNUP|RESET|PHONE_CHANGE), createdAt, expiresAt, consumedAt, verifyAttempts Int @default(0), sessionConsumedAt DateTime? }`
- `PhoneChangeLog { id, userId, oldPhone, newPhone, changedAt }`
- `PinResetLog { id, userId, resetAt }`

## 제약 조건

- 한국 휴대폰 번호만 허용 (`+82` 고정, 국가 코드 선택 UI 없음)
- 솔라피 무료 크레딧 소진 후 건당 8원(VAT 별도) 자체 부담. 가입 1만 명까지 OTP 비용 ≤ 8만원
- Supabase Postgres 무료 티어 500MB. 메타데이터만 저장하므로 사용자 10만 명까지 여유
- JWT 서명 비밀키는 Fly.io secrets로 관리, 로테이션 미지원(MVP 범위 외)
- 생체인식은 `local_auth` 패키지 의존. 안드로이드 6+, iOS 11+에서만 동작

## 예외 케이스

- 잘못된 번호 형식 → 400, "휴대폰 번호 형식을 확인해주세요."
- OTP 발송 쿨다운(1분 내 재요청) → 429, "1분 후 다시 시도해주세요."
- OTP 1시간 내 5회 초과 → 429, "1시간 후 다시 시도해주세요."
- OTP 코드 불일치 → 400. 같은 `requestId` 에 대한 verify 실패는 누적되며 **5회 도달 시 강제 consume + 429** ("인증 시도 횟수를 초과했습니다. 다시 발송해주세요.")
- OTP 만료 → 410 Gone, "인증번호가 만료되었습니다."
- 솔라피 API 실패 → 502, "잠시 후 다시 시도해주세요." + Sentry 알림
- 가입 흐름에서 이미 등록된 번호의 OTP를 검증한 경우 → `isNewUser=false`, 모바일은 PIN 로그인으로 이동
- 새 번호가 이미 다른 계정에 등록됨 → 409 Conflict, "이미 사용 중인 번호입니다."
- PIN 3회 실패 → 안내 모달 노출, 시도는 계속 가능
- PIN 5회 실패 → 423 Locked, 10분 잠금, "SMS 재인증으로 PIN 재설정"
- refresh token 만료·무효 → 401, 로그인 화면으로 이동
- 생체인식 디바이스 미지원·미등록 → 자동으로 PIN 입력으로 fallback

## 채택 근거

**핵심 이유**

- 옷장 앱은 본질적으로 1인용 마찰 최소 UX가 핵심이고, OAuth는 매 로그인 외부 브라우저 왕복이 과한 비용이다.

**보조 이유**

- 솔라피 SMS 8원은 Twilio(68원) 대비 8배 저렴해 운영비 부담 없음
- 토스·당근 패턴이라 한국 사용자에게 학습 비용 0
- Supabase Auth·카카오 콘솔·Apple Developer 셋업 모두 제거 → MVP 출시 일정 단축
- 자체 JWT라 추후 백엔드 정책(세션 관리·기기 제한)을 완전히 통제 가능

**기각된 대안**

- **Supabase Auth + 카카오/애플 OAuth.** 콘솔 셋업·딥링크·번들 ID·키 해시 등 운영자 단계 의존이 크고, 매 로그인 마찰. 기각.
- **Supabase Auth Phone (Twilio 연동).** 건당 68원으로 솔라피 대비 8배 비싸고, Supabase MFA Phone 추가 비용 발생. 기각.
- **카카오 알림톡 OTP.** SMS 대비 절감 0~1원 수준인데 사업자 등록·채널 인증·템플릿 승인이 선결조건. MVP 일정 1~2주 지연. v1.5 이후로 보류.
- **이메일 매직링크.** 휴대폰 번호 식별로 충분, 이메일 등록 단계 추가는 마찰. 기각.
- **PASS 본인확인.** 건당 30~50원 + 월 기본료, MVP에 과함. 기각.

## 비기능 요건

**성능**

- OTP 발송 응답. < 1초 (솔라피 API 호출 포함)
- OTP 검증·JWT 발급. < 200ms
- PIN 검증. < 200ms (bcrypt cost 12 기준)
- 앱 부팅 → 홈 화면. < 2초 (생체인식 포함)

**보안**

- 위협 모델. 외부 공격자의 OTP brute force, PIN brute force, refresh token 탈취, OTP 발송 financial DoS. 범위 외는 디바이스 자체 탈취·악성 앱(MDM 수준 방어).
- OTP는 6자리 숫자(엔트로피 ~20bit)이지만 5분 TTL + 발송 1시간 5회 + 발송 1분 쿨다운 + **verify 5회 시도 제한** 으로 충분. **`/auth/otp/send` 는 글로벌 throttler(IP 기준 60초/5회)로 financial DoS 차단**.
- OTP 코드 저장은 `HMAC-SHA256(JWT_SECRET, code)` 16진수 해시. 비교는 `timingSafeEqual` 상수시간.
- OTP 검증 성공 시 발급되는 단명 세션 토큰(`otpSessionToken`)에는 `jti = OtpRequest.id` 부여. signup/pinReset/changePhone 진입 시 DB에 `sessionConsumedAt` 마킹으로 **1회용** 보장.
- PIN은 bcrypt(cost 12) 해시 저장, 평문 비교 금지.
- JWT access는 30분 단명. refresh는 30일이며 `{tokenId}.{secret}` 형식으로 발급, `RefreshToken.lookupKey` (tokenId의 SHA-256) 단일 row 조회 후 bcrypt(cost 10) 비교 1회로 검증. 사용 시마다 회전. **이미 회전된 refresh 재제시는 탈취로 간주해 해당 사용자 전체 토큰 무효화**.
- `/auth/logout` 은 access token 소유자와 `RefreshToken.userId` 가 같을 때만 무효화 (ownership 검증).
- 모든 API는 HTTPS 강제. Fly.io TLS 종단 + 애플리케이션에서 `helmet` 으로 **HSTS(max-age=1년·includeSubDomains·preload)** 헤더 강제.
- SMS·OTP·PIN 관련 로그에 평문 PII 기록 금지(Sentry PII filter 적용).
- refresh token은 모바일 `flutter_secure_storage`(Keychain/Keystore) 저장.

**확장성**

- 가정 규모. MAU 1만 명까지 OTP 발송 월 ≤ 8만원, DB ≤ 100MB.
- 그 이상 시. 솔라피 대량 할인 적용, OTP 저장소를 Postgres → Redis로 분리, Supabase Pro로 전환 또는 Fly Postgres로 이관.

## 용어 정의

- **OTP.** One-Time Password. SMS로 발송되는 6자리 인증번호.
- **PIN.** 6자리 숫자 비밀번호. 평소 로그인용.
- **otpSessionToken.** OTP 검증 성공 후 5분간 유효한 단명 토큰. PIN 설정·재설정·번호 변경 흐름에서 다음 단계 진입권으로 사용.
- **간접 신호.** SIM·번호 변경을 코드로 감지하지 않고 사용자 행동(미접속·PIN 실패)으로 추정해 안내하는 UX 전략.
- **번호 = 계정.** 한 휴대폰 번호는 한 계정에만 매핑되며, 번호가 곧 식별자라는 정책.
