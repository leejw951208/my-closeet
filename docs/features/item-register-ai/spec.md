# Spec. 옷 등록 AI 분류 (item-register-ai)

> 한 줄 요약. 옷 사진 1장을 받아 배경 제거·카테고리 Top-3·대표 색상을 반환하는 분류 서비스와, 사용자 보정 API를 제공한다.

## 배경

`item-register-api`는 ClassifierService 인터페이스만 의존하고 P1에서는 NullClassifier(전부 null 반환)를 쓰고 있다. 실 분류가 없으면 등록된 옷이 모두 "미분류"로 들어가 옷장 가치가 무너진다.

본 슬러그는 (1) 별도 컨테이너로 동작하는 분류 마이크로서비스 `POST /classify`, (2) NestJS API의 ClassifierService 실 구현체, (3) 사용자 보정 API `PATCH /items/:id/category`와 보정률 분석 이벤트를 책임진다.

## 기능 목록

### F1. 분류 마이크로서비스 `POST /classify`

객체 키를 받아 분류 결과를 반환하는 별도 컨테이너 서비스.

**동작 방식**

- 입력. `{ objectKey: string, modelVersion?: string }`.
- R2/MinIO에서 사진 fetch → 배경 제거 → 카테고리 추론 → 대표 색상 추출.
- 출력. `{ category: ItemCategory|null, top3: [{label, confidence}], colorHex: string|null, modelVersion, requestId }`.
- 모델 버전·신뢰도·요청 ID·처리 시간 로깅.

**포함 범위**

- 8개 카테고리(TOP·BOTTOM·DRESS·OUTER·SHOES·HAT·BAG·ACCESSORY).
- 회귀 셋 100장 Top-1 ≥80%·Top-3 ≥95%(게이트는 `item-register-gates` 에서 측정).

**제외 범위**

- 패턴·소재·핏 인식. → v1.5 이후.
- 사용자 보정 데이터 기반 자동 재학습. → 익명 수집만, 학습은 수동.

### F2. ClassifierService 실 구현체

`item-register-api` 의 NullClassifier를 대체하는 HTTP 어댑터.

**동작 방식**

- `POST /classify` 호출. 타임아웃 5초. 1회 재시도(idempotent 가정).
- 응답 받아 ClassificationResult로 변환.
- 신뢰도 < 0.5 → category=null.
- 타임아웃·5xx → category=null로 즉시 반환 + 백그라운드 재분류 enqueue.

**포함 범위**

- 환경변수 기반 endpoint URL 주입.
- 회로 차단(circuit breaker) 옵션 — v1은 단순 타임아웃·재시도만.

**제외 범위**

- 재분류 큐 구현. 큐 인프라는 `item-register-api` T202와 동일한 결정에 따른다.

### F3. 카테고리 보정 API + 보정 이벤트

사용자가 AI 분류 결과를 1탭으로 수정하면 즉시 반영하고 보정률 분석 이벤트를 발행한다.

**동작 방식**

- `PATCH /items/:id/category` — `{ category: ItemCategory }`. 인증 + 소유자 검증.
- 변경 전 category·신뢰도와 변경 후 category를 analytics에 기록 (`classify_corrected`).
- 응답. `{ id, category, updatedAt }`.

**포함 범위**

- 단건 수정.
- 보정률 분석 이벤트 발행(원래/수정 카테고리·신뢰도 포함).

**제외 범위**

- 일괄 수정.
- Top-3 UI 노출. → `item-register-mobile`.

## 입출력

**입력**

- `POST /classify` (μsvc) — `{ objectKey: string }`. 내부 호출.
- `PATCH /items/:id/category` (API) — `{ category: ItemCategory }`. JWT 필수.

**출력**

- `POST /classify` — `{ category, top3, colorHex, modelVersion, requestId }`.
- `PATCH /items/:id/category` — `{ id, category, updatedAt }`.

## 제약 조건

- `POST /classify` P95 ≤2초(3G 제외). 동시 1,000 요청 에러율 ≤0.5%(게이트는 `item-register-gates`).
- ClassifierService 타임아웃 5초·재시도 1회.
- 객체 키 fetch는 본 마이크로서비스가 R2/MinIO 읽기 권한을 직접 갖는다(NestJS API 통하지 않음).

## 예외 케이스

- 객체 키 없음(미업로드) → 404.
- 모델 추론 실패 → 500 + 빈 top3.
- 사용자가 다른 사용자 Item PATCH 시도 → 403.
- PATCH로 동일 category 전달 → no-op, 이벤트 미발행.

## 채택 근거

**핵심 이유**

- AI 분류는 모델·GPU·메모리 프로파일이 NestJS API와 완전히 달라 별도 컨테이너로 분리해야 한다.

**보조 이유**

- ClassifierService 인터페이스로 NestJS API와 결합도 최소화. v1 모델 교체나 A/B 테스트가 쉬워진다.
- PATCH 라우트는 NestJS API에 두지만 보정률·미분류·재분류 책임이 본 슬러그에 집중되므로 한 묶음으로 관리.

**기각된 대안**

- **클라이언트 온디바이스 분류.** 모델 사이즈·정확도·기기 편차 부담. 1인 운영 단계에서 서버 호출이 단순.
- **NestJS API 내부에서 분류.** GPU 메모리·동시성 프로파일이 달라 격리 필요.

## 비기능 요건

**성능**

- `POST /classify` P95 ≤2초.
- 동시 1,000 요청 에러율 ≤0.5%.
- `PATCH /items/:id/category` P95 ≤200ms.

**보안**

- `POST /classify`는 NestJS API에서만 호출. 내부망 또는 mTLS·shared-secret.
- 외부 공개 금지.

**확장성**

- 가정 규모. MAU 1만, 일 등록 5,000장.
- 그 이상은 마이크로서비스 수평 확장.

## 용어 정의

- **modelVersion.** 분류 모델 의미적 버전. 보정 이벤트와 함께 기록되어 모델 회귀 추적에 사용.
- **classify_corrected.** AI Top-1과 다른 카테고리로 사용자가 수정한 이벤트. 보정률 KPI 입력.
- **재분류 enqueue.** 타임아웃 발생 Item을 백그라운드에서 다시 분류하도록 큐에 적재. 큐 인프라는 `item-register-api`와 공유.
