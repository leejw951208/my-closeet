<!-- My Closet MVP 백엔드·프론트엔드 작업 분해 마스터 목록. -->

# Feature Plan. My Closet MVP

- **Date.** 2026-05-18
- **Source.** [../plan/pm/prd-mvp.md](../plan/pm/prd-mvp.md) v0.2 P0 12개 스토리 기준.
- **Scope.** PRD Phase 1~4 (총 10주) 동안 처리할 백엔드 22 + 프론트엔드 24 + 인프라 5 = **51개 작업**.
- **관련 문서.** [../plan/pm/user-stories.md](../plan/pm/user-stories.md), [../plan/risk/pre-mortem.md](../plan/risk/pre-mortem.md), [../plan/pm/metrics-dashboard.md](../plan/pm/metrics-dashboard.md), [../plan/marketing/gtm-plan.md](../plan/marketing/gtm-plan.md)

## 0. 범위 메모

- PRD v0.2에서 **US-05(5벌 챌린지)와 US-11(날씨 푸시)는 MVP 제외, v1.5 재기획**으로 결정됨. 본 plan에서도 제외.
- 12개 P0 스토리. US-01·02·03·04·06·07·08·09·10·12·13·14.
- 총 작업 51개는 1인 풀스택 기준으로 빠듯. Pre-mortem Elephant E2(팀 사이즈 vs 일정 현실성)를 매주 점검할 것.

---

## 1. 백엔드 (apps/api + packages/database + AI 파이프라인)

### Phase 1. 기반 (Week 1~3)

| ID | 작업 | 관련 US | 비고 |
|----|------|--------|------|
| BE-01 | Prisma 마이그레이션 실행 + 시드 스크립트 | 인프라 | 현재 schema.prisma 기준 첫 `migrate dev` |
| BE-02 | 환경 설정 모듈 (`@nestjs/config` + class-validator) | 인프라 | DB URL·JWT secret·S3 키 등 검증 |
| BE-03 | 글로벌 예외 필터·인터셉터·로깅 미들웨어 | 인프라 | Sentry 연동 포함 |
| BE-04 | 이벤트 로깅 인프라 (서버측 수집 파이프) | US-14 | Amplitude/Mixpanel REST + 자체 BigQuery 적재 |
| BE-05 | 사진 저장소 추상화 (S3 호환 인터페이스 + 로컬 dev용 MinIO) | US-02·US-13 | 사진 암호화 정책 명세 |

### Phase 2. 등록 흐름 (Week 4~6)

| ID | 작업 | 관련 US |
|----|------|--------|
| BE-06 | Auth 모듈 — 카카오/애플 OAuth + 이메일 + JWT 발급·갱신 | US-01 |
| BE-07 | 가입 후 User·Closet 자동 생성 트리거 | US-01 |
| BE-08 | `POST /items` — 단건 옷 등록 (사전서명 URL → 클라이언트 업로드 → 메타 저장) | US-02 |
| BE-09 | `POST /items/batch` — 멀티 업로드 큐 + 진행률 폴링 엔드포인트 | US-03 |
| BE-10 | AI 분류 파이프라인 v1 (배경 제거 + 카테고리 분류 마이크로서비스) | US-04 |
| BE-11 | `PATCH /items/:id/category` — 1탭 카테고리 수정 + 보정률 이벤트 로깅 | US-04 |
| BE-12 | `GET /items` — 필터(category·color)·검색·페이지네이션 | US-06 |
| BE-13 | 이모지 매핑 규칙 (카테고리 + 색상 → 이모지) | US-07 |

### Phase 3. 코디 도구 (Week 7~8)

| ID | 작업 | 관련 US |
|----|------|--------|
| BE-14 | Outfit·OutfitItem CRUD (`POST/GET/DELETE /outfits`) | US-08 |
| BE-15 | `POST /outfits/shuffle` — 셔플 알고리즘(룰 기반 카테고리 1개씩 + 색상 조화 후처리) | US-09 |
| BE-16 | CalendarEntry CRUD + 회상 뷰용 `GET /calendar?month=` | US-10 |

### Phase 4. 공유·동기화·출시 (Week 9~10)

| ID | 작업 | 관련 US |
|----|------|--------|
| BE-17 | `POST /share-events` — OOTD 공유 카운트·목적지 로깅 | US-12 |
| BE-18 | 동기화 엔드포인트 (`GET /sync?since=`) — 증분 fetch | US-13 |
| BE-19 | 사진 암호화 키 관리 (KMS or app-level) + 본인 접근 가드 | US-13 |
| BE-20 | 데이터 익스포트 (`GET /export`) — "내 옷장 내보내기" | Pre-mortem Rollback 자산 |
| BE-21 | 피처 플래그 모듈 (코디 보드·셔플·공유 즉시 OFF용) | Pre-mortem Rollback |
| BE-22 | KPI 9종 대시보드 쿼리 정의 ([metrics-dashboard.md](../plan/pm/metrics-dashboard.md) Input/Health) | OKR Q-PREP O2-KR4 |

---

## 2. 프론트엔드 (apps/mobile, Flutter)

### Phase 1. 기반 (Week 1~3)

| ID | 작업 | 관련 US |
|----|------|--------|
| FE-01 | 디자인 시스템 (theme, color palette, typography, spacing) | 인프라 |
| FE-02 | go_router 기반 라우팅 골격 (login·home·register·closet·outfit·calendar) | 인프라 |
| FE-03 | Riverpod 상태 관리 베이스 (auth provider·api client provider) | 인프라 |
| FE-04 | API 클라이언트 (`Dio` + interceptor: JWT 헤더·토큰 갱신·에러 매핑) | 인프라 |
| FE-05 | 분석 SDK (Amplitude/Mixpanel Flutter SDK) + 공통 이벤트 helper | US-14 |
| FE-06 | Crashlytics(Firebase) 연동 | 인프라 |

### Phase 2. 등록 흐름 (Week 4~6)

| ID | 작업 | 관련 US |
|----|------|--------|
| FE-07 | 로그인 화면 (카카오·애플·이메일 SDK 연동, 약관·14세 동의) | US-01 |
| FE-08 | 카메라·갤러리 진입 UI + 권한 처리 | US-02 |
| FE-09 | 등록 진행 화면 — 미리보기·재촬영·취소 | US-02 |
| FE-10 | 멀티셀렉트(최대 20장) + 백그라운드 일괄 업로드 진행률 | US-03 |
| FE-11 | AI 결과 표시 + 카테고리 1탭 수정 UI | US-04 |
| FE-12 | 옷장 일람 화면 — 필터 칩·그리드·무한 스크롤·검색바 | US-06 |
| FE-13 | 우상단 이모지/사진 뷰 토글 (전체 화면 동기화) | US-07 |
| FE-14 | 등록 N벌 도달 시 "첫 코디 자동 제안" 토스트 (v0.2에서 5벌 챌린지 대체) | PRD 4 디자인 결정 1 |

### Phase 3. 코디 도구 (Week 7~8)

| ID | 작업 | 관련 US |
|----|------|--------|
| FE-15 | 마네킹 코디 보드 — 4슬롯 드래그&드롭 (Draggable + DragTarget) | US-08 |
| FE-16 | 셔플 버튼 + 결과 애니메이션 | US-09 |
| FE-17 | 캘린더 화면 — 월 스와이프, 날짜별 코디 1개+, 회상 뷰 | US-10 |
| FE-18 | "오늘 입기" CTA — 코디 상세 → 캘린더 기록 | US-10 |

### Phase 4. 공유·동기화·출시 (Week 9~10)

| ID | 작업 | 관련 US |
|----|------|--------|
| FE-19 | OOTD 이미지 클라이언트 합성 (마네킹 + 옷 + 워터마크 + 딥링크 QR) | US-12 |
| FE-20 | iOS/Android 시스템 공유 시트 호출 + 목적지 이벤트 로깅 | US-12 |
| FE-21 | 클라우드 동기화 상태 표시 + 오프라인 큐 (sqflite or drift) | US-13 |
| FE-22 | 새 기기 로그인 시 증분 다운로드 진행률 | US-13 |
| FE-23 | 데이터 익스포트 진입점 (설정 화면) | Rollback 자산 |
| FE-24 | 앱스토어 자료 — 스크린샷 5장 + 30초 영상 + 약관·개인정보 노출 | GTM Pre-launch |

---

## 3. 공통·인프라 (별도 트랙)

| ID | 작업 | 비고 |
|----|------|------|
| INF-01 | GitHub Actions CI — pnpm 빌드/테스트, flutter analyze/test, prisma validate | 출시 -8주 |
| INF-02 | Docker 이미지 빌드 + Fly.io / Render 배포 파이프라인 | 출시 -4주 |
| INF-03 | 스테이징 환경 (DB·이미지 버킷) | 출시 -4주 |
| INF-04 | 법무 자문 통과 + 14세 차단 플로우 점검 | Pre-mortem Tiger T5 |
| INF-05 | 앱스토어 심사 가이드라인 체크리스트 | Pre-mortem Tiger T5 |

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

| Tiger | 끼울 대상 | 게이트 기준 |
|-------|----------|------------|
| T1 AI 분류 정확도 | BE-10 | 회귀 셋 100장 Top-1 ≥80%, Top-3 ≥95% |
| T3 코디 보드 Aha | BE-14 + FE-15 | E3 페이퍼 프로토 만족도 ≥7/10 |
| T4 등록 평균 시간 | BE-08 + FE-09 | 실기기 3종 평균 ≤8초, /classify P95 ≤2초 |
| T5 법무·앱스토어 | INF-04 + INF-05 | 법무 자문 통과 + 체크리스트 100% |

---

## 6. 추천 시작 순서 (Week 1)

병렬로 다음 4개를 동시에 진입.

1. **BE-01** (Prisma 마이그레이션 실행) — 백엔드 기반의 첫 검증 가능 산출물
2. **BE-02** (Config 모듈) — BE-06 이후 모든 모듈의 전제
3. **FE-01** (디자인 시스템) — FE-02 이후 모든 화면의 전제
4. **INF-01** (CI 골격) — 이후 모든 PR에 자동 적용

이렇게 잡으면 Week 1 끝나는 시점에 "DB 마이그레이션 통과 + API 부팅 + 첫 화면 토큰 통과 + CI 그린"이 모두 보입니다.
