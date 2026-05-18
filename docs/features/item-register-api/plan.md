# Plan. 옷 등록 백엔드 API (item-register-api)

## 단계 구성

| Phase | 이름             | 목표                                                              |
| ----- | ---------------- | ----------------------------------------------------------------- |
| P1    | 단건 등록 골격    | presign·create·소유자 가드까지 완성. ✅ **이미 완료** (이전 세션) |
| P2    | 단건 보강·결함   | review.md 표 4 결함과 spec 불일치 해소.                            |
| P3    | 일괄 등록 API    | batchId 발급·진행률 조회·재시도·idempotency.                       |

## 구현 태스크

### P1. 단건 등록 골격 (✅ 완료)

- [x] **T001** Item 도메인 모듈·서비스 골격
- [x] **T002** POST /items/presign 컨트롤러
- [x] **T003** 객체 키 규칙 함수
- [x] **T004** POST /items + 소유자 검증
- [x] **T005** Item Repository + Closet upsert 트랜잭션
- [x] **T006** ClassifierService 인터페이스 + NullClassifier
- [x] **T007** unit 테스트 (object-key·classifier·items.service)

### P2. 단건 보강·결함 해소

- [ ] **T101** presigned URL 만료를 3600s로 통일
    - 선행. 없음 · 예상. 0.2h · 근거. _archive_item-register-original/review.md 표 1 F1-4
- [ ] **T102** photoUrl 하드코딩 제거. StorageProvider에 `publicUrl(objectKey)` 추가하고 ItemsService가 사용
    - 선행. 없음 · 예상. 0.5h · 근거. 표 4 row 1
- [ ] **T103** `POST /items`에서 storage.headObject로 업로드 완료 확인
    - 선행. T102 · 예상. 1h · 근거. 표 4 row 3
- [ ] **T104** content-length 검증 (10MB 상한)
    - 선행. 없음 · 예상. 0.5h
- [ ] **T105** CreatedItemView.category 타입을 ItemCategory enum으로 좁히기
    - 선행. 없음 · 예상. 0.3h · 근거. 표 4 row 7
- [ ] **T106** items.controller HTTP 통합 테스트 (JWT 가드·dto validation)
    - 선행. 없음 · 예상. 1h · 근거. 표 3 UNTESTED 1
- [ ] **T107** items.repository 통합 테스트 (Closet 단일성)
    - 선행. 없음 · 예상. 1h · 근거. 표 3 UNTESTED 2
- [ ] **T108** Prisma 마이그레이션 실행 — `pnpm --filter @my-closet/database exec prisma migrate dev --name item-register-api-p1`
    - 선행. 없음 · 예상. 0.2h · 근거. 표 3 UNTESTED 3

### P3. 일괄 등록 API

- [ ] **T201** ItemBatch Prisma 모델 추가 + migration
    - 선행. T108 · 예상. 1h
- [ ] **T202** 배치 큐 인프라 결정 ⚠️ **ESCALATE 사용자 결정 필요**. in-memory(단순) vs BullMQ+Redis(견고)
    - 선행. 없음 · 예상. 결정 후 추정
- [ ] **T203** POST /items/batch + 20장 제한 + idempotency 헤더
    - 선행. T201·T202 · 예상. 2h
- [ ] **T204** 배치 처리 큐 구현 (T202 결정에 따름)
    - 선행. T203 · 예상. 2~4h
- [ ] **T205** GET /items/batch/:batchId 진행률 조회
    - 선행. T204 · 예상. 1h
- [ ] **T206** POST /items/batch/:batchId/retry
    - 선행. T205 · 예상. 1h
- [ ] **T207** 동시성 시나리오 통합 테스트 (20장 × 동시 5명)
    - 선행. T206 · 예상. 2h

## 아키텍처 다이어그램

```
[Flutter]                                [NestJS API]                         [Storage]
  │  POST /items/presign                  │                                      │
  ├─────────────────────────────────────▶│ Storage.presign + key 규칙             │
  │  { uploadUrl, objectKey, 3600s }     │                                      │
  │◀─────────────────────────────────────│                                      │
  │  PUT uploadUrl                       │                                      │
  ├──────────────────────────────────────────────────────────────────────────────▶│
  │  POST /items { objectKey }           │                                      │
  ├─────────────────────────────────────▶│ owns? + headObject + classify(stub) │
  │                                      │ + Item insert                       │
  │  { id, category(null), ... }         │                                      │
  │◀─────────────────────────────────────│                                      │
  │                                                                              │
  │  POST /items/batch { count, ct }     │                                      │
  ├─────────────────────────────────────▶│ ItemBatch row + N presign 발급         │
  │  { batchId, items: [...] }           │                                      │
  │◀─────────────────────────────────────│                                      │
  │  PUT × N                             │                                      │
  ├──────────────────────────────────────────────────────────────────────────────▶│
  │  GET /items/batch/:id (poll)         │                                      │
  ├─────────────────────────────────────▶│ row 조회                             │
  │  { total, completed, failed, items } │                                      │
  │◀─────────────────────────────────────│                                      │
```

## 테스트 매트릭스

| #   | 케이스                            | 입력                                           | 기대 결과                                                  |
| --- | --------------------------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| 1   | 정상 presign + create             | 유효 JWT, jpeg                                 | Item 1건 생성, photoUrl이 storage.publicUrl 반환값          |
| 2   | 타 사용자 objectKey               | u1 JWT, key prefix u2                          | 400 object_key_not_owned                                   |
| 3   | content-length 초과                | 11MB 사진                                       | 400 payload_too_large                                      |
| 4   | 업로드 미완 상태에서 create         | objectKey 발급만 받고 PUT 안 함                | 404 object_not_found (headObject 실패)                     |
| 5   | 정상 batch 10장                    | count=10                                       | 진행률 0→100%, 모두 Item 생성                              |
| 6   | 20장 초과                         | count=21                                       | 400                                                        |
| 7   | 동시 배치                         | 진행 중 추가 POST                              | 409                                                        |
| 8   | idempotent 재호출                  | 동일 Idempotency-Key                           | 첫 응답과 동일 batchId 반환, 신규 row 미생성               |
| 9   | 일부 항목 실패 후 retry            | 5개 중 2개 실패                                | retry 후 failed=0                                          |
| 10  | 분류 타임아웃 (실 classifier 전제) | classifier 5초 초과                            | category=null로 즉시 저장, 백그라운드 재분류 enqueue       |
