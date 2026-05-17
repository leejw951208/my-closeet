<!-- My Closet 기술 스택·인프라 결정 기록. -->

# Tech Stack & Infrastructure

- **Date.** 2026-05-18
- **Status.** v1.0 (MVP 출시 전 마지막 점검 시점에 v1.1로 갱신)
- **결정 원칙.** **시나리오 B (균형)**. 무료 티어로 시작하고 결정 트리거에 닿을 때만 유료로 전환한다. 비용 최적화에 시간을 낭비하지 않되 깜짝 청구도 만들지 않는다.
- **관련 문서.** [features/feature-plan.md](features/feature-plan.md), [plan/pm/prd-mvp.md](plan/pm/prd-mvp.md), [plan/founder/pricing.md](plan/founder/pricing.md)

## 1. 한 줄 요약

> **Flutter + NestJS + Prisma 7 + Supabase Postgres** 모노레포(pnpm workspace). 사진은 **Cloudflare R2**, 에러는 **Sentry**, 분석은 **Amplitude**, 배포는 **Fly.io Tokyo**.

## 2. 레이어별 선택

### 2.1 Compute (백엔드 API)

- **선택.** Fly.io (Tokyo NRT 리전)
- **이유.** PaaS 단순성(1인 운영) + 한국 latency 충분(+30ms) + 무료 티어 + 컨테이너 기반 락인 약함
- **대안 검토 후 탈락.** 네이버 클라우드(엔터프라이즈 복잡도), AWS(비용·학습 부담), Vultr(VPS 운영 시간 소모), Render(cold start 30초+)
- **운영 설정.** `auto_stop_machines = true`, `min_machines_running = 0`, `shared-cpu-1x`(256MB) 시작

### 2.2 DB + Auth

- **선택.** Supabase (Seoul 리전, Session Pooler)
- **이유.** Postgres 표준 + Auth 무료 50k MAU + 한국어 자료 풍부 + Pro $25 단일 가격
- **대안 검토 후 탈락.** Neon(Auth 직접 구현 1~2주 비용), Fly Postgres(관리 부담), Naver Cloud DB(락인)
- **Auth 전략.** Supabase Auth가 OAuth·JWT 발급, NestJS는 JWT 검증만. 50k MAU 도달 또는 커스텀 세션 요구 시 자체 Auth 이관 재평가
- **DB 액세스.** Prisma 7 + driver adapter(`@prisma/adapter-pg`). 마이그레이션은 Session Pooler(port 5432) 사용

### 2.3 Object Storage (사진)

- **선택.** Cloudflare R2
- **이유.** **Egress $0** (이미지 다운로드 트래픽 비용 0). MAU 15k 기준 AWS S3 대비 월 ~$2,000 절감. S3 호환 API로 코드 변경 없음
- **대안 검토 후 탈락.** AWS S3($0.09/GB egress 폭탄), Vultr Object Storage(서울 리전 없음), Firebase Storage($0.12/GB egress)
- **CDN.** Cloudflare 자동 통합

### 2.4 로컬 개발 Storage

- **선택.** MinIO (docker-compose)
- **이유.** S3 호환 → R2와 동일 SDK. 오프라인 가능

### 2.5 인증 (Auth)

- **선택.** Supabase Auth (위 2.2 참조)
- **흐름.** Supabase가 카카오/애플/이메일 OAuth + JWT 발급 → 모바일이 받음 → NestJS는 Bearer JWT 검증 후 user_id만 추출
- **Firebase Auth 비채택 이유.** Supabase에 통합 + Postgres RLS 활용 가치

### 2.6 모바일 크래시 + 백엔드 에러 모니터링

- **선택.** Sentry (모바일·백엔드 단일 organization)
- **이유.** Node.js·Flutter 동시 1급 지원 + 모바일↔백엔드 trace 자동 연결 + 무료 5k events/월 + 콘솔 1개
- **대안 검토 후 탈락.** Firebase Crashlytics(Node.js SDK 없음 → 백엔드 분리 필요), GCP Error Reporting(콘솔 분산), 자체 로그(검색·알림 없음)
- **운영 설정.** `tracesSampleRate: 0.1`, 401·404 등 정상 흐름 에러 `beforeSend`로 필터, MAU 도달 시 Team 플랜 $26 검토

### 2.7 제품 분석

- **선택.** Amplitude Starter (무료 10M events/월)
- **이유.** 코호트·퍼널 분석이 Firebase Analytics보다 강함. PRD metrics-dashboard 이벤트 카탈로그와 직접 매핑
- **대안.** PostHog Cloud(1M 무료 + Session Replay), 자체 호스팅
- **운영 설정.** 이벤트 카탈로그 20개 이하 유지

### 2.8 푸시 알림 (v1.5)

- **선택.** Firebase FCM (v1.5 도입)
- **이유.** 사실상 표준, 대안 없음
- **현재 상태.** MVP에 푸시 추천(US-11) 자체가 빠져서 Firebase는 v1.5까지 도입 안 함

### 2.9 AI 추론

- **선택.** Replicate (서버리스 GPU, 사용량 과금) → MAU 10k+ 시 온디바이스(CoreML/TFLite) 마이그
- **이유.** 초기 검증은 사용량당 ~$0.001로 시작, 검증 후 온디바이스로 한계비용 0 달성
- **대안.** Modal(직접 GPU), 자체 호스팅(시간 부담)

### 2.10 CI/CD

- **선택.** GitHub Actions (CI), Fly.io 배포 파이프라인 (CD)
- **이유.** GitHub와 통합, public repo 무료
- **상태.** INF-01 미구현, Phase 1 후반 진입

### 2.11 도구 버전 관리

- **선택.** mise (`mise.toml`)
- **현재 핀.** node 24, pnpm 11, flutter 3.41.5

## 3. 모노레포 구조

```
my-closet/
├── apps/
│   ├── api/                 # NestJS 11 + Prisma 7
│   └── mobile/              # Flutter 3.41
├── packages/
│   └── database/            # Prisma 스키마 + 생성 클라이언트 (도메인별 분리)
├── docs/                    # 기획·기술 문서
├── docker-compose.yml       # 로컬 PostgreSQL·MinIO
├── mise.toml                # node·pnpm·flutter 버전
├── pnpm-workspace.yaml
└── package.json
```

- **모노레포 도구.** pnpm workspace (Nx·Turborepo 미사용 — 규모상 오버킬)
- **Prisma 스키마.** 도메인별 파일 분리 (user·closet·outfit·calendar)
- **PK.** UUID v7 (`@default(uuid(7)) @db.Uuid`)

## 4. 환경별 구성

| 환경         | Compute           | DB·Auth                                | Storage                |
| ------------ | ----------------- | -------------------------------------- | ---------------------- |
| **로컬**     | `pnpm api:dev`    | Supabase dev 프로젝트 (ap-northeast-2) | MinIO (docker-compose) |
| **스테이징** | Fly.io (별도 app) | Supabase 무료 프로젝트 별도            | R2 버킷 별도           |
| **운영**     | Fly.io (Tokyo)    | Supabase Pro                           | R2 운영 버킷           |

## 5. 비용 예측 (시나리오 B 기준)

| 단계                        | 사용자             | 월 비용     |
| --------------------------- | ------------------ | ----------- |
| 개발 중 (~10명)             | -                  | **$0**      |
| 클로즈드 베타 (~200명)      | Fly.io 시작        | **$0~5**    |
| 오픈 베타 (~1k)             | Fly.io 풀타임      | **$5~15**   |
| 출시 직후 (~5k MAU)         | Supabase Free 유지 | **$15~30**  |
| **PRD 90일 목표 (15k MAU)** | Supabase Pro 진입  | **$65~100** |
| 50k MAU                     | Pro + add-on       | $200~400    |
| 100k+ MAU                   | 아키텍처 재검토    | $500+       |

### MAU 15k 시 세부 (운영 시작점)

| 항목                              | 비용           |
| --------------------------------- | -------------- |
| Fly.io (auto_stop, shared-cpu-1x) | ~$15           |
| Supabase Pro                      | $25            |
| Cloudflare R2 (사진 ~20GB)        | ~$15           |
| Sentry Developer → Team 트리거 시 | $0~$26         |
| Amplitude Starter                 | $0             |
| 도메인                            | ~$1            |
| **합계**                          | **$56~$82/월** |

## 6. 결정 트리거 (모니터링 대상)

| 트리거                      | 행동                                  |
| --------------------------- | ------------------------------------- |
| Supabase DB 400MB 도달      | Pro $25 업그레이드                    |
| Sentry 월 events 4,000 초과 | Team $26 또는 샘플링 강화             |
| Fly.io 머신 RAM 80% 지속    | 한 단계 위 머신 또는 horizontal scale |
| AI 추론 월 $50 초과         | 온디바이스 마이그 본격 검토           |
| Amplitude 8M 이벤트 도달    | PostHog 이전 또는 유료 플랜           |
| Supabase Auth MAU 50k 도달  | 자체 Auth 이관 평가                   |

## 7. 비용 폭증 차단 가드

| 위험                    | 차단                                              |
| ----------------------- | ------------------------------------------------- |
| 봇이 사진 무한 다운로드 | Cloudflare WAF rate limit + bot fight mode (무료) |
| AI API 오남용           | 사용자당 일일 한도 (예. 200장/일)                 |
| Supabase row 폭증       | Cron으로 deleted 7일 지난 데이터 hard delete      |
| Sentry 이벤트 burst     | `tracesSampleRate` + `beforeSend` 필터            |
| Fly.io 머신 안 꺼짐     | 매주 콘솔 확인 + alert 설정                       |

## 8. 결제 모델

| 서비스            | 카드 필요 시점       | 자동 업그레이드      |
| ----------------- | -------------------- | -------------------- |
| Fly.io            | 배포 시작            | 사용량 자동 과금     |
| Supabase Free     | 불필요               | ❌ Pro 전환은 수동   |
| Supabase Pro      | 업그레이드 시        | 자동 청구            |
| Cloudflare R2     | R2 활성화 시         | 사용량 자동 과금     |
| Sentry Developer  | 불필요 (이벤트 drop) | ❌ Team 전환은 수동  |
| Amplitude Starter | 불필요               | ❌ 한도 초과 시 차단 |

→ **자동 업그레이드는 없음**. 비싼 플랜은 본인이 직접 선택해야 함.

## 9. 변경 이력

| 일자       | 변경                                                              |
| ---------- | ----------------------------------------------------------------- |
| 2026-05-17 | 모노레포 초기 구성 (Flutter + NestJS + Prisma 7 + 로컬 Postgres)  |
| 2026-05-17 | mise로 node·pnpm·flutter 버전 관리 시작                           |
| 2026-05-17 | PK를 cuid에서 UUID v7로 전환                                      |
| 2026-05-18 | Supabase Auth + DB로 결정 (Neon 후보 탈락)                        |
| 2026-05-18 | Storage R2 + 로컬 MinIO 결정                                      |
| 2026-05-18 | Sentry 단일 도구로 모바일·백엔드 통합 (Firebase Crashlytics 탈락) |
| 2026-05-18 | 시나리오 B (균형) 비용 전략 채택                                  |
| 2026-05-18 | Prisma 스키마 도메인별 파일 분리                                  |

## 10. 의도적으로 안 쓰는 것

- **Firebase (MVP).** Crashlytics·Auth·Storage·Analytics·Firestore 모두 다른 도구로 대체. FCM만 v1.5에서 도입
- **AWS.** 비용·복잡도 모두 MVP엔 오버킬
- **Nx·Turborepo.** 패키지 2~3개 규모엔 오버킬, 5+개 되면 Turborepo 재검토
- **Naver Cloud.** 한국 latency 우위가 R2 + Cloudflare CDN으로 충분히 보완됨
- **자체 호스팅(Coolify·Dokku).** devops 시간이 가장 희소한 자원
