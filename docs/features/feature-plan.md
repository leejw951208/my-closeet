<!-- My Closet MVP 백엔드·프론트엔드 작업 분해 마스터 목록. -->

# Feature Plan. My Closet MVP

- **Date.** 2026-05-18
- **Source.** [../plan/pm/prd-mvp.md](../plan/pm/prd-mvp.md) v0.2 P0 12개 스토리 기준.
- **Scope.** PRD Phase 1~4 (총 10주) 동안 처리할 백엔드 22 + 프론트엔드 24 + 인프라 5 = **51개 작업**, **15개 feature slug**.
- **관련 문서.** [../plan/pm/user-stories.md](../plan/pm/user-stories.md), [../plan/risk/pre-mortem.md](../plan/risk/pre-mortem.md), [../plan/pm/metrics-dashboard.md](../plan/pm/metrics-dashboard.md), [../plan/marketing/gtm-plan.md](../plan/marketing/gtm-plan.md)

## 0. 범위 메모

- PRD v0.2에서 **US-05(5벌 챌린지)와 US-11(날씨 푸시)는 MVP 제외, v1.5 재기획**으로 결정됨. 본 plan에서도 제외.
- 12개 P0 스토리. US-01·02·03·04·06·07·08·09·10·12·13·14.
- 총 작업 51개는 1인 풀스택 기준으로 빠듯. Pre-mortem Elephant E2(팀 사이즈 vs 일정 현실성)를 매주 점검할 것.
- **Slug 운영.** feature-\_ 스킬(`/feature-plan <slug>`, `/feature-implement <slug>` 등)이 `docs/features/<slug>/` 폴더 단위로 spec·plan·progress·review를 관리한다. 한 slug에 BE/FE 작업이 모두 포함되도록 수직 슬라이스로 묶었다.
- **인증 전략.** Supabase Auth로 OAuth·JWT 발급을 위임. NestJS는 Supabase가 발급한 JWT를 검증해 user_id만 추출한다(자체 OAuth·세션 관리 없음). Supabase Auth가 50k MAU 무료 한도를 넘거나 커스텀 세션 요구가 생기면 그 시점에 자체 Auth로 이관 평가.

---

## 1. 백엔드 (apps/api + packages/database + AI 파이프라인)

### Phase 1. 기반 (Week 1~3)

| ID    | 작업                                                       | 관련 US     | Slug                 | 비고                                         |
| ----- | ---------------------------------------------------------- | ----------- | -------------------- | -------------------------------------------- |
| BE-01 | Prisma 마이그레이션 실행 + 시드 스크립트                   | 인프라      | `backend-foundation` | ✅ 완료 (2026-05-18)                         |
| BE-02 | 환경 설정 모듈 (`@nestjs/config` + class-validator)        | 인프라      | `backend-foundation` | ✅ 완료                                      |
| BE-03 | 글로벌 예외 필터·인터셉터·로깅 미들웨어                    | 인프라      | `backend-foundation` | ✅ 완료 (Sentry 후크 위치만)                 |
| BE-04 | 이벤트 로깅 인프라 (서버측 수집 파이프)                    | US-14       | `analytics-pipeline` | ✅ 완료 (콘솔 sink, Amplitude 교체 후속)     |
| BE-05 | 사진 저장소 추상화 (S3 호환 인터페이스 + 로컬 dev용 MinIO) | US-02·US-13 | `backend-foundation` | ✅ 완료 (LocalStorageProvider, R2 구현 후속) |

### Phase 2. 등록 흐름 (Week 4~6)

| ID    | 작업                                                                        | 관련 US | Slug            |
| ----- | --------------------------------------------------------------------------- | ------- | --------------- |
| BE-06 | Supabase Auth JWT 검증 미들웨어 + Guard (카카오 OAuth provider 등록 포함)   | US-01   | `auth-login`    |
| BE-07 | Supabase 사용자 메타데이터 ↔ 도메인 User·Closet 동기화 (webhook 또는 lazy)  | US-01   | `auth-login`    |
| BE-08 | `POST /items` — 단건 옷 등록 (사전서명 URL → 클라이언트 업로드 → 메타 저장) | US-02   | `item-register` |
| BE-09 | `POST /items/batch` — 멀티 업로드 큐 + 진행률 폴링 엔드포인트               | US-03   | `item-register` |
| BE-10 | AI 분류 파이프라인 v1 (배경 제거 + 카테고리 분류 마이크로서비스)            | US-04   | `item-register` |
| BE-11 | `PATCH /items/:id/category` — 1탭 카테고리 수정 + 보정률 이벤트 로깅        | US-04   | `item-register` |
| BE-12 | `GET /items` — 필터(category·color)·검색·페이지네이션                       | US-06   | `closet-browse` |
| BE-13 | 이모지 매핑 규칙 (카테고리 + 색상 → 이모지)                                 | US-07   | `closet-browse` |

### Phase 3. 코디 도구 (Week 7~8)

| ID    | 작업                                                                               | 관련 US | Slug                |
| ----- | ---------------------------------------------------------------------------------- | ------- | ------------------- |
| BE-14 | Outfit·OutfitItem CRUD (`POST/GET/DELETE /outfits`)                                | US-08   | `outfit-coordinate` |
| BE-15 | `POST /outfits/shuffle` — 셔플 알고리즘(룰 기반 카테고리 1개씩 + 색상 조화 후처리) | US-09   | `outfit-coordinate` |
| BE-16 | CalendarEntry CRUD + 회상 뷰용 `GET /calendar?month=`                              | US-10   | `calendar-wear`     |

### Phase 4. 공유·동기화·출시 (Week 9~10)

| ID    | 작업                                                                                              | 관련 US                  | Slug                |
| ----- | ------------------------------------------------------------------------------------------------- | ------------------------ | ------------------- |
| BE-17 | `POST /share-events` — OOTD 공유 카운트·목적지 로깅                                               | US-12                    | `ootd-share`        |
| BE-18 | 동기화 엔드포인트 (`GET /sync?since=`) — 증분 fetch                                               | US-13                    | `cloud-sync`        |
| BE-19 | 사진 암호화 키 관리 (KMS or app-level) + 본인 접근 가드                                           | US-13                    | `cloud-sync`        |
| BE-20 | 데이터 익스포트 (`GET /export`) — "내 옷장 내보내기"                                              | Pre-mortem Rollback 자산 | `data-export`       |
| BE-21 | 피처 플래그 모듈 (코디 보드·셔플·공유 즉시 OFF용)                                                 | Pre-mortem Rollback      | `feature-flags`     |
| BE-22 | KPI 9종 대시보드 쿼리 정의 ([metrics-dashboard.md](../plan/pm/metrics-dashboard.md) Input/Health) | OKR Q-PREP O2-KR4        | `metrics-dashboard` |

---

## 2. 프론트엔드 (apps/mobile, Flutter)

### Phase 1. 기반 (Week 1~3)

| ID    | 작업                                                                    | 관련 US | Slug                 |
| ----- | ----------------------------------------------------------------------- | ------- | -------------------- |
| FE-01 | 디자인 시스템 (theme, color palette, typography, spacing)               | 인프라  | `mobile-foundation`  |
| FE-02 | go_router 기반 라우팅 골격 (login·home·register·closet·outfit·calendar) | 인프라  | `mobile-foundation`  |
| FE-03 | Riverpod 상태 관리 베이스 (auth provider·api client provider)           | 인프라  | `mobile-foundation`  |
| FE-04 | API 클라이언트 (`Dio` + interceptor: JWT 헤더·토큰 갱신·에러 매핑)      | 인프라  | `mobile-foundation`  |
| FE-05 | 분석 SDK (Amplitude/Mixpanel Flutter SDK) + 공통 이벤트 helper          | US-14   | `analytics-pipeline` |
| FE-06 | Sentry Flutter 연동 (tech-stack 2.6에 따라 Crashlytics 비채택)          | 인프라  | `mobile-foundation`  |

### Phase 2. 등록 흐름 (Week 4~6)

| ID    | 작업                                                                         | 관련 US             | Slug            |
| ----- | ---------------------------------------------------------------------------- | ------------------- | --------------- |
| FE-07 | 로그인 화면 (Supabase Flutter SDK — 카카오·애플·이메일 흐름, 약관·14세 동의) | US-01               | `auth-login`    |
| FE-08 | 카메라·갤러리 진입 UI + 권한 처리                                            | US-02               | `item-register` |
| FE-09 | 등록 진행 화면 — 미리보기·재촬영·취소                                        | US-02               | `item-register` |
| FE-10 | 멀티셀렉트(최대 20장) + 백그라운드 일괄 업로드 진행률                        | US-03               | `item-register` |
| FE-11 | AI 결과 표시 + 카테고리 1탭 수정 UI                                          | US-04               | `item-register` |
| FE-12 | 옷장 일람 화면 — 필터 칩·그리드·무한 스크롤·검색바                           | US-06               | `closet-browse` |
| FE-13 | 우상단 이모지/사진 뷰 토글 (전체 화면 동기화)                                | US-07               | `closet-browse` |
| FE-14 | 등록 N벌 도달 시 "첫 코디 자동 제안" 토스트 (v0.2에서 5벌 챌린지 대체)       | PRD 4 디자인 결정 1 | `closet-browse` |

### Phase 3. 코디 도구 (Week 7~8)

| ID    | 작업                                                          | 관련 US | Slug                |
| ----- | ------------------------------------------------------------- | ------- | ------------------- |
| FE-15 | 마네킹 코디 보드 — 4슬롯 드래그&드롭 (Draggable + DragTarget) | US-08   | `outfit-coordinate` |
| FE-16 | 셔플 버튼 + 결과 애니메이션                                   | US-09   | `outfit-coordinate` |
| FE-17 | 캘린더 화면 — 월 스와이프, 날짜별 코디 1개+, 회상 뷰          | US-10   | `calendar-wear`     |
| FE-18 | "오늘 입기" CTA — 코디 상세 → 캘린더 기록                     | US-10   | `calendar-wear`     |

### Phase 4. 공유·동기화·출시 (Week 9~10)

| ID    | 작업                                                             | 관련 US        | Slug          |
| ----- | ---------------------------------------------------------------- | -------------- | ------------- |
| FE-19 | OOTD 이미지 클라이언트 합성 (마네킹 + 옷 + 워터마크 + 딥링크 QR) | US-12          | `ootd-share`  |
| FE-20 | iOS/Android 시스템 공유 시트 호출 + 목적지 이벤트 로깅           | US-12          | `ootd-share`  |
| FE-21 | 클라우드 동기화 상태 표시 + 오프라인 큐 (sqflite or drift)       | US-13          | `cloud-sync`  |
| FE-22 | 새 기기 로그인 시 증분 다운로드 진행률                           | US-13          | `cloud-sync`  |
| FE-23 | 데이터 익스포트 진입점 (설정 화면)                               | Rollback 자산  | `data-export` |
| FE-24 | 앱스토어 자료 — 스크린샷 5장 + 30초 영상 + 약관·개인정보 노출    | GTM Pre-launch | `launch-prep` |

---

## 3. 공통·인프라 (별도 트랙)

| ID     | 작업                                                                        | 비고                | Slug              |
| ------ | --------------------------------------------------------------------------- | ------------------- | ----------------- |
| INF-01 | GitHub Actions CI — pnpm 빌드/테스트, flutter analyze/test, prisma validate | 출시 -8주           | `ci-foundation`   |
| INF-02 | Docker 이미지 빌드 + Fly.io / Render 배포 파이프라인                        | 출시 -4주           | `deploy-pipeline` |
| INF-03 | 스테이징 환경 (DB·이미지 버킷)                                              | 출시 -4주           | `deploy-pipeline` |
| INF-04 | 법무 자문 통과 + 14세 차단 플로우 점검                                      | Pre-mortem Tiger T5 | `launch-prep`     |
| INF-05 | 앱스토어 심사 가이드라인 체크리스트                                         | Pre-mortem Tiger T5 | `launch-prep`     |

---

## 4. 의존성 핵심 경로

```
INF-01 ─┐
        ├─▶ BE-01·02·03·04·05 ─▶ BE-06·07 ─▶ BE-08·09·10·11·12·13
        │                          │              │
FE-01·02·03·04·05·06 ─────────────┴─▶ FE-07 ─▶ FE-08~14
                                                │
                                                ▼
                                       BE-14·15·16 ─▶ FE-15·16·17·18
                                                │
                                                ▼
                                       BE-17·18·19 ─▶ FE-19·20·21·22
```

---

## 5. Tigers 게이트 (PRD 7-1 반영)

각 작업의 완료 정의(Definition of Done)에 다음 게이트를 끼워 측정 가능하게 한다.

| Tiger             | 끼울 대상       | 게이트 기준                              |
| ----------------- | --------------- | ---------------------------------------- |
| T1 AI 분류 정확도 | BE-10           | 회귀 셋 100장 Top-1 ≥80%, Top-3 ≥95%     |
| T3 코디 보드 Aha  | BE-14 + FE-15   | E3 페이퍼 프로토 만족도 ≥7/10            |
| T4 등록 평균 시간 | BE-08 + FE-09   | 실기기 3종 평균 ≤8초, /classify P95 ≤2초 |
| T5 법무·앱스토어  | INF-04 + INF-05 | 법무 자문 통과 + 체크리스트 100%         |

---

## 6. 추천 시작 순서 (Week 1)

병렬로 다음 4개 slug를 동시에 진입.

1. **`backend-foundation`** (BE-01·02·03·05) — ✅ 이미 완료. 추가로 Sentry·R2 실 구현은 후속 slug에서.
2. **`mobile-foundation`** (FE-01~06) — 디자인 시스템·라우팅·Riverpod·API 클라이언트.
3. **`ci-foundation`** (INF-01) — GitHub Actions 골격. 이후 모든 PR에 자동 적용.
4. **`auth-login`** (BE-06·07, FE-07) — Week 1 후반 진입 가능. backend-foundation·mobile-foundation 진행 중에 OAuth 발급·시크릿 준비.

이렇게 잡으면 Week 1 끝나는 시점에 "DB 마이그레이션 통과 + API 부팅 + 첫 화면 토큰 통과 + CI 그린"이 모두 보입니다.

---

## 7. Slug 사전

feature-\_ 스킬은 slug 단위로 동작한다. 각 slug별 구성 작업·관련 US·DoD 게이트는 다음과 같다.

| Slug                 | 포함 작업                                              | 관련 US             | Tiger 게이트 | 상태         |
| -------------------- | ------------------------------------------------------ | ------------------- | ------------ | ------------ |
| `backend-foundation` | BE-01, BE-02, BE-03, BE-05                             | 인프라              | —            | ✅ 완료      |
| `mobile-foundation`  | FE-01, FE-02, FE-03, FE-04, FE-06                      | 인프라              | —            | 대기         |
| `ci-foundation`      | INF-01                                                 | 인프라              | —            | 대기         |
| `analytics-pipeline` | BE-04, FE-05, BE-22                                    | US-14               | —            | BE-04만 완료 |
| `auth-login`         | BE-06, BE-07, FE-07                                    | US-01               | —            | 대기         |
| `item-register`      | BE-08, BE-09, BE-10, BE-11, FE-08, FE-09, FE-10, FE-11 | US-02, US-03, US-04 | T1·T4        | 대기         |
| `closet-browse`      | BE-12, BE-13, FE-12, FE-13, FE-14                      | US-06, US-07        | —            | 대기         |
| `outfit-coordinate`  | BE-14, BE-15, FE-15, FE-16                             | US-08, US-09        | T3           | 대기         |
| `calendar-wear`      | BE-16, FE-17, FE-18                                    | US-10               | —            | 대기         |
| `ootd-share`         | BE-17, FE-19, FE-20                                    | US-12               | —            | 대기         |
| `cloud-sync`         | BE-18, BE-19, FE-21, FE-22                             | US-13               | —            | 대기         |
| `data-export`        | BE-20, FE-23                                           | Rollback 자산       | —            | 대기         |
| `feature-flags`      | BE-21                                                  | Rollback            | —            | 대기         |
| `metrics-dashboard`  | BE-22                                                  | OKR Q-PREP          | —            | 대기         |
| `deploy-pipeline`    | INF-02, INF-03                                         | 인프라              | —            | 대기         |
| `launch-prep`        | INF-04, INF-05, FE-24                                  | GTM Pre-launch      | T5           | 대기         |

> 메모. `analytics-pipeline`과 `metrics-dashboard`는 BE-22가 양쪽에 포함되도록 표기되어 있다. 실 구현 시 `analytics-pipeline`에서 BE-22 쿼리를 한 번 정의하면 `metrics-dashboard`는 시각화 layer만 다루도록 정리한다.

### 사용 예시

```bash
/feature-plan auth-login           # docs/features/auth-login/ 에 spec.md·plan.md·progress.md 생성
/feature-implement auth-login      # 위 계획 기반 구현 시작
/feature-verify auth-login         # 코드 리뷰·검증·보안 감사 → review.md
/feature-patch auth-login          # review.md의 OPEN 항목 보강
/feature-autoverify auth-login     # verify ↔ patch 루프 자동 진행
```
