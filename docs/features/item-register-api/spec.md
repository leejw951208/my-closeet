# Spec. 옷 등록 백엔드 API (item-register-api)

> 한 줄 요약. 사진 사전서명 발급·옷 메타 저장·일괄 등록 진행률 조회까지 백엔드 단일 책임.

## 배경

옷 등록 슬러그가 백엔드 API + AI 분류 서비스 + Flutter UI + 게이트 검증을 한 묶음으로 잡았다가 OPEN 44건이 누적되어 단일 verify·patch 루프로 처리할 수 없었다. 이를 4개 슬러그로 쪼개 각각 의미 있는 단위로 관리한다.

본 슬러그는 백엔드 NestJS API만 다룬다. 사진 바이트는 API 서버를 거치지 않고 사전서명 URL을 통해 클라이언트가 직접 저장소에 올린다. AI 분류는 `item-register-ai` 가 제공하는 ClassifierService 인터페이스를 주입받아 사용한다(P1에서는 NullClassifier 사용).

## 기능 목록

### F1. 단건 등록 API

`POST /items/presign`, `POST /items` 두 엔드포인트로 사진 1장 등록을 완료한다.

**동작 방식**

- `POST /items/presign` → contentType 검증 후 `users/{userId}/items/{itemId}.{ext}` 규칙으로 사전서명 URL 발급.
- 클라이언트가 사전서명 URL로 R2/MinIO에 PUT 업로드.
- `POST /items` → objectKey 소유자 가드 → ClassifierService 호출 → Closet upsert → Item insert → 결과 반환.

**포함 범위**

- contentType jpeg/png 화이트리스트.
- objectKey path prefix 검증으로 타 사용자 키 차단.
- presigned URL 만료 1시간.
- Closet lazy 생성(User 1:1).
- ClassifierService 인터페이스만 의존(실 구현은 `item-register-ai`).

**제외 범위**

- 실제 AI 분류 호출. → `item-register-ai`.
- 옷 상세 수정·삭제. → 후속 슬러그.

### F2. 일괄 등록 API

`POST /items/batch`, `GET /items/batch/:batchId`, `POST /items/batch/:batchId/retry` 3개 엔드포인트로 최대 20장 일괄 처리.

**동작 방식**

- `POST /items/batch` → ItemBatch row 생성 + 항목별 사전서명 URL 발급. idempotency-key 헤더 지원.
- 클라이언트가 각 사진 PUT.
- 백엔드 큐가 항목별 ClassifierService 호출·Item 저장.
- `GET /items/batch/:batchId` → 진행률·실패 항목 조회.
- `POST /items/batch/:batchId/retry` → 실패 항목 재처리.

**포함 범위**

- 최대 20장 제한·초과 시 400.
- 사용자당 동시 진행 1개 제한·중복 요청 시 409.
- idempotency. 동일 키 재호출 시 첫 응답 그대로.

**제외 범위**

- 외부 푸시 알림. → MVP 인앱 토스트만(Flutter 슬러그).

## 입출력

**입력**

- `POST /items/presign` — `{ contentType: "image/jpeg"|"image/png" }`. 인증 필수.
- `POST /items` — `{ objectKey: string }`. 인증 필수.
- `POST /items/batch` — `{ count: number(1~20), contentType: string }`. 인증 필수. 헤더 `Idempotency-Key` 선택.
- `GET /items/batch/:batchId` — 인증 필수.
- `POST /items/batch/:batchId/retry` — 인증 필수.

**출력**

- `POST /items/presign` — `{ uploadUrl, publicUrl, objectKey, expiresInSeconds: 3600 }`.
- `POST /items` — `{ id, category, colorHex, photoUrl, aiConfidence, registeredAt }`.
- `POST /items/batch` — `{ batchId, items: [{ itemId, uploadUrl, objectKey }] }`.
- `GET /items/batch/:batchId` — `{ batchId, total, completed, failed, items: [{ itemId, status, error? }] }`.

## 제약 조건

- 사진 단건 최대 10MB(서버 측 거부 — content-length 검증).
- 분류 호출 타임아웃 5초·1회 재시도. 타임아웃 시 category=null로 저장하고 백그라운드 재분류 enqueue.
- 사진은 본인만 접근. 객체 키 prefix가 `users/{userId}/items/`.

## 예외 케이스

- 사전서명 URL 만료 후 PUT → 클라이언트가 재발급 요청.
- 타 사용자 objectKey → 400 object_key_not_owned.
- 분류 타임아웃 → category=null 저장 후 즉시 응답.
- 분류 신뢰도 < 0.5 → category=null, "미분류" 상태.
- 20장 초과 → 400.
- 동시 배치 → 409.
- 동일 idempotency-key → 첫 응답 그대로.

## 채택 근거

**핵심 이유**

- 사진 바이트가 API 서버를 거치지 않게 해 비용·지연을 동시에 낮춘다. NestJS API는 메타데이터만 다룬다.

**보조 이유**

- ClassifierService 인터페이스 분리로 AI 슬러그와 독립 개발·테스트 가능.
- 배치는 별도 ItemBatch 모델·큐로 단건 흐름의 멱등성·진행률 책임 분리.

**기각된 대안**

- API가 사진 multipart 받아 분류 서비스로 전달. 비용·지연 증가.
- 단건 API 하나로 batch까지 처리. 진행률·재시도·idempotency 결합 시 복잡도 증가.

## 비기능 요건

**성능**

- `POST /items` 동기 응답 P95 ≤2.5초(분류 포함).
- `POST /items/batch` 응답 P95 ≤1초(큐 enqueue만 동기).
- `GET /items/batch/:batchId` P95 ≤200ms.

**보안**

- 위협 모델. 본인 옷 사진 무단 열람 방지. 보호 범위는 객체 스토리지·메타 DB·API.
- 글로벌 AuthGuard로 모든 라우트 JWT 인증 필수.
- objectKey path prefix 소유자 검증.
- presigned URL 1시간 만료.
- 영구 공개 URL 발급 금지.

**확장성**

- MAU 1만 명·1인당 80벌. 80만 Item, 0.8TB.
- 배치 큐는 v1 in-memory(단일 인스턴스)로 시작, 인스턴스 확장 시 BullMQ/Redis.

## 용어 정의

- **Item.** 옷 한 벌. Closet에 속하며 사진·카테고리·색상·신뢰도를 갖는다.
- **Closet.** User 1:1 컨테이너. 첫 Item 등록 시 lazy 생성.
- **ItemBatch.** 일괄 등록 한 묶음. 진행률 조회 키.
- **idempotency-key.** 클라이언트가 발급하는 멱등성 식별자. 동일 키 재호출은 첫 응답 그대로.
- **미분류.** AI 신뢰도 < 0.5 또는 타임아웃인 Item. `category = null`.
