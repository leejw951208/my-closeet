# Review: item-register-api

## 리뷰 개요

- 일자: 2026-05-18 (Round 3 — P3 일괄 등록 구현 후 최종)
- Spec: docs/features/item-register-api/spec.md
- Plan: docs/features/item-register-api/plan.md

---

## 1. Spec 일치 여부

| 처리상태 | 심각도 | 판정 | #     | 요구사항                                         | 근거                                                            | 보강 지시 |
| -------- | ------ | ---- | ----- | ------------------------------------------------ | --------------------------------------------------------------- | --------- |
| CLOSED   | -      | DONE | F1-1  | POST /items/presign + 객체 키 규칙                | items.controller.ts:14, object-key.ts                            | -         |
| CLOSED   | -      | DONE | F1-2  | POST /items + 소유자 가드 + Closet upsert         | items.service.ts:67-103                                          | -         |
| CLOSED   | -      | DONE | F1-3  | presigned URL 만료 1시간                          | local-storage.provider.ts:13                                     | -         |
| CLOSED   | -      | DONE | F1-4  | 사진 단건 최대 10MB 서버 측 거부                   | items.service.ts:36-41, dto/items.dto.ts:16                      | -         |
| CLOSED   | -      | DONE | F1-5  | 업로드 완료 확인 (headObject)                      | items.service.ts:76-86                                            | -         |
| CLOSED   | -      | DONE | F2-1  | POST /items/batch 20장·idempotency                | batch.controller.ts:22, batch.service.ts:53-95                    | -         |
| CLOSED   | -      | DONE | F2-2  | GET /items/batch/:batchId 진행률                   | batch.controller.ts:38, batch.service.ts:98-119                   | -         |
| CLOSED   | -      | DONE | F2-3  | POST /items/batch/:batchId/retry                  | batch.controller.ts:46, batch.service.ts:121-130                  | -         |

**요약:** DONE 8 / PARTIAL 0 / NOT DONE 0 / CHANGED 0

---

## 2. Plan 일치 여부

| 처리상태 | 심각도 | 판정 | 태스크                                          | 근거                                          | 보강 지시 |
| -------- | ------ | ---- | ----------------------------------------------- | --------------------------------------------- | --------- |
| CLOSED   | -      | DONE | T001~T007 (P1 단건 골격)                         | apps/api/src/items/                            | -         |
| CLOSED   | -      | DONE | T101~T108 (P2 보강·결함·마이그레이션)              | items.service·storage·dto·spec·migrate reset    | -         |
| CLOSED   | -      | DONE | T201 ItemBatch 모델 + migration                   | schema/closet.prisma:32-70, p3-batch migration   | -         |
| CLOSED   | -      | DONE | T202 배치 큐 인프라 결정 (in-memory)              | batch-queue.ts InMemoryBatchQueue                | -         |
| CLOSED   | -      | DONE | T203 POST /items/batch                            | batch.controller.ts:22                           | -         |
| CLOSED   | -      | DONE | T204 배치 처리 큐 + process                       | batch.service.ts:132-172                         | -         |
| CLOSED   | -      | DONE | T205 GET /items/batch/:batchId                    | batch.controller.ts:38                           | -         |
| CLOSED   | -      | DONE | T206 POST /items/batch/:batchId/retry             | batch.controller.ts:46                           | -         |
| CLOSED   | -      | DONE | T207 동시성·idempotency 통합 테스트                | batch.service.spec.ts (8 케이스)                 | -         |

**스코프 이탈:** 없음

---

## 3. 테스트 커버리지

| 처리상태 | 심각도 | 판정   | 요구사항                              | 테스트                                            |
| -------- | ------ | ------ | ------------------------------------- | ------------------------------------------------- |
| CLOSED   | -      | TESTED | 객체 키 규칙·확장자                    | object-key.spec.ts (9 tests)                       |
| CLOSED   | -      | TESTED | NullClassifier                         | classifier.service.spec.ts (1 test)                |
| CLOSED   | -      | TESTED | items.service (presign·create·가드·size) | items.service.spec.ts (9 tests)               |
| CLOSED   | -      | TESTED | items.controller HTTP                  | items.controller.spec.ts (6 tests)                  |
| CLOSED   | -      | TESTED | items.repository Closet upsert·item    | items.repository.spec.ts (4 tests)                  |
| CLOSED   | -      | TESTED | InMemoryBatchQueue FIFO·에러 격리·미등록 | batch-queue.spec.ts (3 tests)                      |
| CLOSED   | -      | TESTED | BatchService 생성·진행률·process·재시도 | batch.service.spec.ts (8 tests)                    |

**미테스트:** 0건

---

## 4. 발견 항목

| 처리상태 | 심각도 | 신뢰도 | 분류 | 위치 | 내용 | 보강 지시 |
| -------- | ------ | ------ | ---- | ---- | ---- | --------- |
| (없음 — Round 1/2 식별 4건 모두 CLOSED) |

### Appendix (confidence 5 미만)

(없음)

---

## 5. 기능 검증

- `pnpm --filter @my-closet/api test` → 13 suite · 86 tests pass.
- `pnpm --filter @my-closet/api exec tsc --noEmit` → 통과.
- Prisma `migrate dev --name item-register-api-p3-batch` → 사용자 실행 성공.

---

## 6. 보안 감사

- 글로벌 AuthGuard로 모든 `/items/*` 라우트 JWT 인증.
- 단건. objectKey path prefix 소유자 가드 + headObject 존재 검증.
- 배치. `getProgress`·`retry`가 `batch.userId !== currentUser.id` 시 404 반환 (정보 노출 최소화).
- presigned URL 1시간 만료. 영구 공개 URL 없음.
- 동시 배치 제한(409)으로 자원 폭주 차단.
- idempotency-key 동일 키 재호출은 첫 응답 그대로 → 재시도 안전.
