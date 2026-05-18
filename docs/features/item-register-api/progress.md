# Progress. 옷 등록 백엔드 API (item-register-api)

## 현재 단계

✅ **전체 완료 (verified)** — P1·P2·P3 + 마이그레이션 적용 완료

## 기능별 진행 현황

### P1. 단건 등록 골격 (✅ 완료)

| 태스크 | 설명                                          | 상태    |
| ------ | --------------------------------------------- | ------- |
| T001~T007 | 백엔드 골격 + unit 테스트                  | ✅ 완료 |

### P2. 단건 보강·결함 해소 (✅ 완료)

| 태스크 | 설명                                                  | 상태    |
| ------ | ----------------------------------------------------- | ------- |
| T101   | presigned URL 만료 3600s                              | ✅ 완료 |
| T102   | StorageProvider.publicUrl + items.service 사용         | ✅ 완료 |
| T103   | headObject로 업로드 완료 확인                          | ✅ 완료 |
| T104   | content-length 10MB 검증                              | ✅ 완료 |
| T105   | CreatedItemView.category enum 타입                    | ✅ 완료 |
| T106   | items.controller HTTP 통합 테스트 (6)                  | ✅ 완료 |
| T107   | items.repository 단위 테스트 (4)                       | ✅ 완료 |
| T108   | Prisma 마이그레이션 (reset 적용)                       | ✅ 완료 |

### P3. 일괄 등록 API (✅ 코드 완료)

| 태스크 | 설명                                                    | 상태    |
| ------ | ------------------------------------------------------- | ------- |
| T201   | ItemBatch·ItemBatchItem Prisma 모델 + 두 enum            | ✅ 완료 |
| T202   | 배치 큐 인프라 결정 (in-memory 채택)                     | ✅ 완료 |
| T203   | POST /items/batch (20장·idempotency-key 헤더)            | ✅ 완료 |
| T204   | InMemoryBatchQueue 구현 + BatchService.process            | ✅ 완료 |
| T205   | GET /items/batch/:batchId                                | ✅ 완료 |
| T206   | POST /items/batch/:batchId/retry                         | ✅ 완료 |
| T207   | 동시성·idempotency 통합 테스트 (8개)                     | ✅ 완료 |

## 블로커 / 이슈 / 특이사항

- **마이그레이션 완료.** `prisma migrate dev --name item-register-api-p3-batch` 사용자 실행 성공. ItemBatch·ItemBatchItem 테이블·enum 생성됨.
- **테스트.** 13 suite · 86 tests 전체 통과.
- **신규 파일.**
  - `apps/api/src/items/batch/batch-queue.ts` — BatchQueue 추상 + InMemoryBatchQueue
  - `apps/api/src/items/batch/batch.repository.ts` — ItemBatch·ItemBatchItem 영속화
  - `apps/api/src/items/batch/batch.service.ts` — 생성·진행률·재시도·process
  - `apps/api/src/items/batch/batch.controller.ts` — POST/GET 3개 엔드포인트
  - `apps/api/src/items/batch/dto/batch.dto.ts` — CreateBatchDto
  - `apps/api/src/items/batch/batch-queue.spec.ts` — 큐 단위 테스트 3
  - `apps/api/src/items/batch/batch.service.spec.ts` — 서비스 단위 테스트 8
- **수정 파일.**
  - `apps/api/src/items/items.module.ts` — BatchController·BatchService·BatchRepository·BatchQueue 등록
  - `packages/database/prisma/schema/closet.prisma` — ItemBatch·ItemBatchItem·두 enum 추가
  - `packages/database/prisma/schema/user.prisma` — itemBatches 역참조 추가

## 최근 업데이트

2026-05-18

## 다음 액션 아이템

| 담당 | 내용                                                   | 기한 |
| ---- | ------------------------------------------------------ | ---- |
|      | `prisma migrate dev --name item-register-api-p3-batch` 1회 실행 | -    |
|      | (선택) BullMQ로 큐 교체 시점. 인스턴스 분리 또는 batch 유실이 문제될 때. | -    |
