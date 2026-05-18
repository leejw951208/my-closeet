# Review: item-register

## 리뷰 개요

- 일자: 2026-05-18
- Spec: docs/features/item-register/spec.md
- Plan: docs/features/item-register/plan.md
- 검증 라운드: 1 (autoverify)
- 검증 범위. 현재까지 구현된 P1(T001~T007) 백엔드 단건 등록 골격 + Prisma 스키마 변경. P2~P6은 미구현 상태로 OPEN 기록.

---

## 1. Spec 일치 여부

| 처리상태 | 심각도 | 판정     | #     | 요구사항                                                                | 근거                                                                              | 보강 지시                                                                              |
| -------- | ------ | -------- | ----- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| OPEN     | high   | PARTIAL  | F1-1  | 카메라/갤러리 단건 등록 흐름 (앱 + 서버)                                | 서버 `POST /items/presign`·`POST /items` 만 구현. 클라이언트 미구현              | P4 Flutter 흐름 구현 필요. 별도 세션에서 T021~T029 진행                                |
| OPEN     | high   | NOT DONE | F1-2  | 클라이언트 측 이미지 압축(긴 변 1600·quality 85)                        | 코드 없음. 클라이언트 미구현                                                      | P4 T024 구현 필요                                                                      |
| OPEN     | med    | NOT DONE | F1-3  | 사진 단건 최대 10MB 서버 측 거부                                        | items.service.ts 어디에도 size 검증 없음                                          | 사전서명 발급 시 또는 메타 저장 시 size hint 검증 추가. 최소 contentLength 가드.       |
| OPEN     | med    | CHANGED  | F1-4  | 사전서명 URL 1시간 만료                                                 | local-storage.provider.ts:23 `expiresInSeconds: 900` (15분)                       | LocalStorageProvider 만료 3600으로 통일 또는 spec.md 갱신해 15분 정책으로 변경         |
| OPEN     | high   | NOT DONE | F2-1  | `POST /items/batch` 멀티 업로드 큐 + 진행률 폴링                         | items.controller.ts에 batch 라우트 없음                                           | P3 T015~T020 구현 필요                                                                 |
| OPEN     | high   | NOT DONE | F2-2  | 갤러리 멀티 셀렉트 최대 20장 UI                                          | Flutter 미구현                                                                    | P5 T030 구현 필요                                                                      |
| OPEN     | high   | NOT DONE | F2-3  | 백그라운드 큐 + 인앱 토스트                                              | Flutter 미구현                                                                    | P5 T031~T032 구현 필요                                                                 |
| OPEN     | crit   | NOT DONE | F3-1  | 분류 마이크로서비스 `POST /classify` (배경 제거 + 카테고리 Top-3 + 색상) | classifier.service.ts는 NullClassifier 만 존재 (항상 null 반환)                   | T008 모델 선정 후 T009·T010 구현 필요. 사용자 결정 선행: MediaPipe·CLIP·자체 학습 중 1 |
| OPEN     | high   | NOT DONE | F3-2  | 회귀 셋 100장 Top-1 ≥80%·Top-3 ≥95% 검증                                 | T012 미수행                                                                       | T012·T036 회귀 셋 수집·자동 측정 스크립트                                              |
| OPEN     | high   | NOT DONE | F3-3  | 분류 타임아웃 5초·신뢰도 < 0.5 미분류 분기·백그라운드 재분류             | items.service.ts:56 timeout/retry 없이 await classify(). NullClassifier로 우회됨  | T010·T013 구현. 실 classifier 도입 후 결선                                             |
| OPEN     | crit   | NOT DONE | F4-1  | `PATCH /items/:id/category` 카테고리 1탭 수정 + 보정률 이벤트            | items.controller.ts에 PATCH 라우트 없음                                           | T014 구현 (소유자 검증 포함)                                                           |
| OPEN     | high   | NOT DONE | F4-2  | 카테고리 1탭 수정 UI (Top-3 큰 버튼·전체 목록)                           | Flutter 미구현                                                                    | P5 T034 구현                                                                           |
| CLOSED   | -      | DONE     | F1-D1 | `POST /items/presign` 사전서명 발급                                     | items.controller.ts:14, items.service.ts:29                                       | -                                                                                      |
| CLOSED   | -      | DONE     | F1-D2 | `POST /items` 메타 저장 + 소유자 가드                                   | items.controller.ts:19, items.service.ts:51-83                                    | -                                                                                      |
| CLOSED   | -      | DONE     | F1-D3 | 객체 키 규칙 `users/{userId}/items/{itemId}.{ext}`                       | object-key.ts:22-32                                                                | -                                                                                      |
| CLOSED   | -      | DONE     | F1-D4 | jpeg/png 화이트리스트                                                    | object-key.ts:3-6, dto/items.dto.ts:5                                              | -                                                                                      |
| CLOSED   | -      | DONE     | F3-D1 | 미분류(category=null) Item 저장 지원                                    | closet.prisma:18 `category ItemCategory?`, items.repository.ts:44                 | -                                                                                      |
| CLOSED   | -      | DONE     | F1-D5 | Closet 자동 lazy 생성 + Item 트랜잭션 저장                              | items.repository.ts:32-49                                                          | -                                                                                      |

**요약:** DONE 6 / PARTIAL 1 / NOT DONE 10 / CHANGED 1

---

## 2. Plan 일치 여부

| 처리상태 | 심각도 | 판정     | 태스크                                              | 근거                                          | 보강 지시                                                  |
| -------- | ------ | -------- | --------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| CLOSED   | -      | DONE     | T001 Item 도메인 모듈 골격                          | items.module.ts                               | -                                                          |
| CLOSED   | -      | DONE     | T002 POST /items/presign                            | items.controller.ts:14                        | -                                                          |
| CLOSED   | -      | DONE     | T003 객체 키 규칙 함수                              | object-key.ts                                 | -                                                          |
| CLOSED   | -      | DONE     | T004 POST /items 컨트롤러·DTO·소유자 검증           | items.controller.ts:19, items.service.ts:75   | -                                                          |
| CLOSED   | -      | DONE     | T005 Item Repository(create) + 트랜잭션             | items.repository.ts                           | -                                                          |
| CLOSED   | -      | DONE     | T006 ClassifierService 인터페이스 + null 구현체     | classifier.service.ts                         | -                                                          |
| CLOSED   | -      | DONE     | T007 unit 테스트                                    | object-key.spec / items.service.spec / classifier.service.spec | -                                          |
| OPEN     | crit   | NOT DONE | T008 분류 모델 PoC 비교 보고서                      | 미수행                                        | **ESCALATE 사용자 결정 필요.** MediaPipe·CLIP·자체학습     |
| OPEN     | crit   | NOT DONE | T009 분류 서비스 컨테이너 구현·배포                 | 미수행                                        | T008 결정 후 진행                                          |
| OPEN     | crit   | NOT DONE | T010 ClassifierService 실 구현체 + 타임아웃·재시도  | NullClassifier만 존재                          | T009 완료 후                                               |
| OPEN     | high   | NOT DONE | T011 Item.category/colorHex/aiConfidence 결선        | 흐름은 있으나 Null 반환                       | T010 완료 후 결선 검증                                     |
| OPEN     | high   | NOT DONE | T012 회귀 셋 100장 수집·라벨링·자동 측정             | 미수행                                        | 분류 모델과 함께 진행                                      |
| OPEN     | med    | NOT DONE | T013 신뢰도 < 0.5 → 미분류 분기                     | 코드 없음                                     | T010 도입 후 추가                                          |
| OPEN     | crit   | NOT DONE | T014 PATCH /items/:id/category + 보정 이벤트         | 라우트 미존재                                 | 단독 구현 가능. 사용자 결정 불필요                         |
| OPEN     | high   | NOT DONE | T015 ItemBatch Prisma 모델·migration                 | schema에 ItemBatch 없음                       | 모델 추가 후 `prisma migrate dev --name item-batch`        |
| OPEN     | high   | NOT DONE | T016 POST /items/batch (20장·idempotency)            | 미구현                                        | T015 후                                                    |
| OPEN     | high   | NOT DONE | T017 배치 처리 큐                                    | 미구현                                        | **ESCALATE 사용자 결정 필요.** in-memory vs BullMQ/Redis   |
| OPEN     | high   | NOT DONE | T018 GET /items/batch/:batchId                       | 미구현                                        | T017 후                                                    |
| OPEN     | med    | NOT DONE | T019 배치 재시도 엔드포인트                          | 미구현                                        | T018 후                                                    |
| OPEN     | med    | NOT DONE | T020 부하 시나리오 통합 테스트                       | 미수행                                        | T019 후                                                    |
| OPEN     | high   | NOT DONE | T021~T029 P4 Flutter 단건 등록 흐름                  | apps/mobile/lib/features/item_register/ 없음  | 별도 큰 단위 세션. 9 태스크.                               |
| OPEN     | high   | NOT DONE | T030~T035 P5 Flutter 일괄 등록 + 수정                | 미수행                                        | P4 완료 후                                                 |
| OPEN     | crit   | NOT DONE | T036 T1 게이트 (Top-1 ≥80%)                          | 모델 미존재                                   | T012 완료 후                                               |
| OPEN     | crit   | NOT DONE | T037 T4 게이트 (등록 ≤8초)                           | 실기기 측정 미수행                            | P4·P5 완료 후 실기기 3종                                   |
| OPEN     | high   | NOT DONE | T038 /classify P95 부하 테스트                       | 분류 서비스 미존재                            | T009 완료 후                                               |
| OPEN     | med    | NOT DONE | T039 분석 이벤트 결선 확인                            | item_registered·classify_corrected 이벤트 미정의 | T014·T032 후                                            |
| OPEN     | low    | NOT DONE | T040 progress·review 정리                             | 본 review.md가 시작                            | 모든 OPEN 해소 후 최종 갱신                                |

**스코프 이탈:** 없음

---

## 3. 테스트 커버리지

| 처리상태 | 심각도 | 판정     | 요구사항                                          | 테스트                                                                   | 보강 지시                                                                          |
| -------- | ------ | -------- | ------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| CLOSED   | -      | TESTED   | 객체 키 규칙·확장자 매핑                          | object-key.spec.ts (9 tests)                                              | -                                                                                  |
| CLOSED   | -      | TESTED   | NullClassifier null 반환                          | classifier.service.spec.ts (1 test)                                       | -                                                                                  |
| CLOSED   | -      | TESTED   | presign·create·소유자 가드                        | items.service.spec.ts (6 tests)                                           | -                                                                                  |
| OPEN     | med    | UNTESTED | items.controller HTTP layer (JWT 가드 통과·소유자) | controller에 직접 spec 없음                                              | items.controller.spec.ts 추가. CurrentUser·dto validation 통합 테스트              |
| OPEN     | med    | UNTESTED | Repository ↔ Prisma 실 DB 통합 (Closet upsert)    | items.repository.spec.ts 없음                                            | 실 DB 사용 통합 테스트(또는 prisma 모킹). userId 중복 호출 시 closet 단일성 확인  |
| OPEN     | high   | UNTESTED | DB 마이그레이션 실행 검증                          | `prisma migrate dev --name item-register-p1` 미실행                       | 마이그레이션 1회 실행·`schema.prisma` ↔ DB 일치 확인                                |
| OPEN     | low    | UNTESTED | e2e. presign → 가상 upload → create 라운드트립    | e2e spec 없음                                                            | supertest로 두 엔드포인트 라운드트립 (NullClassifier 사용)                         |

**미테스트:** 4건

---

## 4. 발견 항목

| 처리상태 | 심각도 | 신뢰도 | 분류 | 위치                                          | 내용                                                                                                                                                       | 보강 지시                                                                                                |
| -------- | ------ | ------ | ---- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| OPEN     | high   | 9      | BUG  | apps/api/src/items/items.service.ts:57         | `photoUrl`이 `/uploads/{objectKey}` 형태로 하드코딩됨. LocalStorageProvider 가정에 묶여 있어 R2/S3 환경에서 깨진다.                                          | StorageProvider 인터페이스에 `publicUrl(objectKey)` 메서드 추가하거나 presign 응답의 publicUrl 활용     |
| OPEN     | med    | 8      | BUG  | apps/api/src/storage/local-storage.provider.ts:23 | `expiresInSeconds: 900` (15분)이지만 spec은 1시간(3600s)을 요구한다. 클라이언트가 큰 사진 업로드 중 만료 가능.                                              | 3600으로 변경하거나 spec 갱신                                                                            |
| OPEN     | med    | 8      | SECURITY | apps/api/src/items/items.service.ts:51-73 | `POST /items`가 `objectKey` 형식만 검증하고 실제 R2/MinIO에 파일이 존재하는지 확인하지 않는다. 악성 클라이언트가 임의 키를 보내 빈 Item 생성 가능.            | storage.headObject(objectKey) 추가해 업로드 완료 확인 후 메타 저장. 또는 R2 webhook                       |
| OPEN     | low    | 7      | DX   | apps/api/src/items/items.service.ts:39         | presign 단계에서 생성한 `itemId`(UUID)가 실제 DB Item.id와 다르다. 객체 키 안의 itemId는 단순 토큰이고 Item 생성 후 별도 PK가 생긴다.                       | 의도된 동작이면 spec 용어 정의에 명시. 통일하려면 presign 응답에 itemId 포함하고 create에서 그대로 사용  |
| OPEN     | med    | 8      | QA   | packages/database/prisma/schema/closet.prisma:18 | `Item.category`를 nullable로 변경했으나 마이그레이션 미수행. 운영 DB와 schema가 불일치.                                                                     | `pnpm --filter @my-closet/database exec prisma migrate dev --name item-register-p1` 1회 실행            |
| OPEN     | low    | 6      | DX   | apps/api/src/items/items.controller.ts         | `POST /items` 라우트에 `@Throttle` 미적용. 기본 limit 60/min은 통과하지만 사진 업로드 API는 별도 정책이 합리적.                                              | 필요 시 `@Throttle({ items: { limit: 30, ttl: 60_000 } })` 추가                                          |
| OPEN     | low    | 7      | DX   | apps/api/src/items/items.service.ts:11-18      | `CreatedItemView.category` 타입이 `string \| null`. enum 정확성 잃음. 컨트롤러 응답 OpenAPI 생성 시 손해.                                                    | `ItemCategory \| null`로 타입 좁히기                                                                     |
| OPEN     | med    | 9      | QA   | apps/api/src/items/items.service.ts:56         | 실 classifier 도입 시 `await classify()`에 타임아웃 가드가 없어 무한 대기 가능. NullClassifier로 가려져 있음.                                                | T010에서 `Promise.race` 5s 타임아웃 + AbortController 추가. 본 review에서는 OPEN 기록만                  |

### Appendix (confidence 5 미만)

| 처리상태 | 심각도 | 신뢰도 | 분류  | 위치                                          | 내용                                                                                            | 보강 지시                                              |
| -------- | ------ | ------ | ----- | --------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| OPEN     | low    | 4      | OTHER | apps/api/src/items/items.module.ts            | `ItemsService`만 export. 다른 모듈이 ItemsRepository 직접 의존 시 재노출 필요할 수 있음.        | 의존 발생 시 추가                                      |
| OPEN     | low    | 3      | OTHER | apps/api/src/items/items.service.ts:39         | UUID v4 사용. spec.md 어디서도 v7 강제하지 않지만 다른 도메인은 v7 사용 중(스키마 default).      | 통일성 위해 v7로 바꿀지 검토                           |

---

## 5. 기능 검증

수동 e2e 미수행. 단위 테스트만 통과 확인.

- `pnpm --filter @my-closet/api test` → 9 suite · 62 tests pass (신규 16 포함)
- `pnpm --filter @my-closet/api exec tsc --noEmit` → 통과

운영 환경 행동(실제 R2 업로드, JWT 인증 통합, AI 분류 응답) 검증은 미수행. T008 모델 선정 후 e2e 가능.

---

## 6. 보안 감사

표 4번 항목으로 흡수. 별도 cso 실행 없이 spec.md 보안 조항(JWT 인증·objectKey 소유자 검증·presigned 만료)과 코드 대조.

- ✅ 글로벌 AuthGuard로 `POST /items/*` 보호됨 (auth.guard.ts:23, @Public 없음)
- ✅ objectKey path 소유자 가드 (items.service.ts:75)
- ⚠️ presigned URL 만료 spec 불일치 (15분 vs 1시간) — 표 4 row 2
- ⚠️ 업로드 완료 여부 미확인 — 표 4 row 3 (빈 Item 생성 가능)
- ✅ 메타 저장 후 photoUrl이 본인 경로에 속함 (assertOwnsObjectKey 통과)
- 🟡 GDPR/PII 측면. 사진은 본인 식별 가능 정보 가능성. spec NFR에 본인만 접근 명시, presigned로 보호. 추가 암호화는 BE-19 cloud-sync 슬러그 범위.

---

## 라운드 결과

```
[ROUND 1/5] FEATURE=item-register  VERIFY=ok  OPEN=27  PATCH=blocked  RETRIED=0
```

PATCH 차단 사유:
- T008·T017 두 항목이 **ESCALATE (사용자 결정 필요)** — 분류 모델 선택 및 배치 큐 인프라 선택.
- T021~T035 (15개 Flutter 태스크)는 한 세션 범위를 크게 초과 — 자동 patch로 일괄 처리하면 단조 반복으로 진전 없이 한도 소진 가능성 높음.
- T036~T038은 외부 인프라(실기기·부하 환경) 필요.

자동 루프를 더 돌려도 같은 OPEN이 반복될 것이므로 단일-feature 모드 규칙에 따라 **여기서 중단**한다.
