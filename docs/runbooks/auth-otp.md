<!-- 자체 OTP/PIN 인증 시스템 운영 런북. 솔라피 셋업·JWT 비밀키 로테이션·OTP 리밋 조정. -->

# Auth OTP Runbook

## 의존 외부 서비스

- **솔라피(SOLAPI).** 한국 SMS 발송. 건당 8원(VAT 별도).
- **Supabase Postgres (서울 리전).** User·RefreshToken·OtpRequest·Log 저장.

## 1. 솔라피 초기 셋업

### 1-1. 계정 가입·발신번호 등록

1. https://solapi.com 에서 사업자(또는 개인) 가입
2. 콘솔 → 발신번호 관리 → **발신번호 등록** (본인 휴대폰 또는 사업자 번호, 통신서비스 이용증명원 첨부)
3. 승인 1~3영업일 소요

### 1-2. API 키 발급

1. 콘솔 → API Keys → **API Key 생성** (`READ`, `WRITE` 권한)
2. `API Key`, `API Secret`을 안전한 곳에 저장 (Fly secrets로 즉시 이동)

### 1-3. Fly.io secrets 등록

```bash
fly secrets set \
  SOLAPI_API_KEY="<발급받은 키>" \
  SOLAPI_API_SECRET="<발급받은 시크릿>" \
  SOLAPI_SENDER="01000000000" \
  --app my-closet-api
```

## 2. JWT 비밀키

### 2-1. 신규 생성

```bash
openssl rand -hex 48  # 96자 헥사. 32바이트 이상 권장.
```

### 2-2. Fly에 등록

```bash
fly secrets set \
  JWT_SECRET="<위 출력>" \
  JWT_ACCESS_TTL_MIN=30 \
  JWT_REFRESH_TTL_DAYS=30 \
  OTP_SESSION_TTL_MIN=5 \
  --app my-closet-api
```

### 2-3. 로테이션

**현재 정책.** MVP는 단일 시크릿. 로테이션이 필요할 시점에는 dual-key (current + previous) 전환 코드를 추가.

긴급 로테이션이 필요하면 (예. 시크릿 유출):

1. 새 시크릿 발급 후 `fly secrets set JWT_SECRET=...` 으로 즉시 교체
2. **결과.** 모든 access·refresh·OTP 세션 토큰이 즉시 무효화 → 사용자 전체 재로그인 필요
3. 사용자에게는 "보안 강화 작업으로 일시적으로 재로그인이 필요합니다" 푸시 공지

## 3. OTP 리밋·보안 정책

기본값 (소스. `apps/api/src/auth/otp.service.ts`).

- OTP 유효 시간 5분
- 발송 쿨다운 60초 (같은 phoneNumber)
- 1시간 윈도 5회 발송 제한 (같은 phoneNumber)
- **`/auth/otp/send` 글로벌 throttler 60초 / 5회** (IP 기준, financial DoS 차단 — `apps/api/src/app.module.ts`)
- **verify 5회 시도 시 강제 consume + 429** (같은 `requestId`, brute force 차단)
- OTP 코드 저장은 `HMAC-SHA256(JWT_SECRET, code)` 16진수. `timingSafeEqual` 상수시간 비교.
- OTP 세션 토큰은 1회용. `jti = OtpRequest.id` 부여 후 진입 시 `sessionConsumedAt` 마킹.
- PIN 5회 연속 실패 시 10분 잠금

리밋을 환경별로 다르게 가져가려면 `OTP_TTL_SECONDS`, `OTP_COOLDOWN_SECONDS`, `OTP_WINDOW_LIMIT`, throttler 설정 등을 환경변수로 옮기고 `AppConfigSchema`에 추가. MVP는 상수.

## 3a. Refresh token 정책

- 형식. `{tokenId UUID}.{secret 48hex}` (모바일이 그대로 보관)
- 저장. `RefreshToken.lookupKey = SHA256(tokenId)` unique 인덱스 + `tokenHash = bcrypt(secret, cost=10)`
- 검증. lookupKey로 단일 row 조회 + bcrypt 비교 1회 (O(1))
- 회전. 사용 시마다 신규 쌍 발급, 구 row `revokedAt` 마킹
- **재사용 감지.** 이미 `revokedAt` 인 row의 secret이 다시 제시되면 탈취 가능성 → `revokeAllForUser(userId)` 후 401
- 로그아웃. access token 소유자와 `RefreshToken.userId` 가 일치할 때만 무효화 (ownership 검증)

## 3b. HTTPS·HSTS

- 코드. `apps/api/src/main.ts` 에서 `helmet({ hsts: { maxAge: 31_536_000, includeSubDomains: true, preload: true } })`
- Fly.io 기본 TLS 종단을 그대로 사용. 추가 인증서 작업 불필요.
- HSTS preload 등록을 원하면 https://hstspreload.org 에서 도메인 등록 가능 (옵션).

## 4. 사용량·비용 모니터링

- 솔라피 콘솔 → 통계 → 일별 발송량 확인
- 월 비용 예상. `발송 건수 × 8원 × 1.1(VAT)`
- 1만 건/월 = ~88,000원

**임계치 알림.** 솔라피 잔액 자동 충전 설정 또는 잔액 5만원 미만 시 이메일 알림 설정.

## 5. 자주 발생하는 운영 이슈

### 5-1. "1분 후 다시 시도해주세요"가 계속 뜨는 사용자

- 원인. 같은 번호로 1분 내 재요청
- 대응. 사용자가 1분 기다리면 자동 해소. 비정상 패턴(같은 번호로 1시간 내 5회 초과)이면 자동 차단

### 5-2. SMS 도달 실패

- 솔라피 콘솔에서 발송 상태 확인 (`SUCCESS` / `FAIL` / `PENDING`)
- 통신사 차단 번호인 경우 발신번호를 추가 등록·전환

### 5-3. PIN 잠금 사용자 CS 응대

- 사용자는 앱 내 "PIN을 잊으셨나요?" → SMS 재인증으로 스스로 해제 가능
- 번호 자체가 바뀌어 SMS를 못 받는 경우는 정책상 **복구 불가**. 새 번호로 가입 안내.

## 6. 데이터 보존·삭제

- `OtpRequest` 행은 7일 후 삭제 권장 (cron 또는 pg_cron 으로 처리)
- `RefreshToken` 행은 만료(`expiresAt < NOW()`) 30일 후 삭제
- `PhoneChangeLog`, `PinResetLog`는 감사 목적으로 영구 보존

## 6a. Prisma 마이그레이션

### 초기 적용 (auth-login 슬러그)

```bash
pnpm --filter @my-closet/database exec prisma migrate dev --name auth-init
```

### 보강 1라운드 (auth-hardening)

`RefreshToken.lookupKey` 추가 + `tokenHash @unique` 제거, `OtpRequest.verifyAttempts`·`sessionConsumedAt` 추가.

```bash
pnpm --filter @my-closet/database exec prisma migrate dev --name auth-hardening
```

**⚠️ 운영 배포 전 필수.** 마이그레이션 누락 시 부팅이 prisma 단에서 실패하거나 런타임에 컬럼 부재로 500이 발생한다.

운영 환경에서는 `prisma migrate deploy` 를 CI/CD에 묶어 자동화한다.

## 7. 관련 코드 위치

- 백엔드. `apps/api/src/auth/`, `apps/api/src/sms/`
- 모바일. `apps/mobile/lib/features/auth/`
- 스키마. `packages/database/prisma/schema/user.prisma`, `auth.prisma`
- 환경 변수. `apps/api/.env.example`
