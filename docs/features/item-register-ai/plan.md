# Plan. 옷 등록 AI 분류 (item-register-ai)

## 단계 구성

| Phase | 이름                       | 목표                                                          |
| ----- | -------------------------- | ------------------------------------------------------------- |
| P1    | 모델 선정 + μsvc 구현      | `POST /classify` 가 동작하고 회귀 셋 측정 가능.                |
| P2    | API 어댑터 결선            | NestJS의 NullClassifier가 실 구현체로 교체된다.                |
| P3    | 보정 API + 분석            | PATCH 라우트와 보정률 이벤트가 동작한다.                       |

## 구현 태스크

### P1. 모델 선정 + μsvc 구현

- [ ] **T001** 분류 모델 PoC 비교 ⚠️ **ESCALATE 사용자 결정 필요**
    - 후보. MediaPipe Image Classifier(작고 빠름) / OpenCLIP zero-shot(파인튜닝 불필요) / 자체 EfficientNet 학습(정확도 최대)
    - 의사결정 기준. 회귀 셋 100장 Top-1, 추론 P95, 메모리, 운영 비용.
    - 산출. 짧은 PoC 보고서 1장.
- [ ] **T002** 분류 마이크로서비스 컨테이너 골격 (FastAPI 또는 Node.js)
    - 선행. T001 · 예상. 3h
- [ ] **T003** `POST /classify` 구현. R2/MinIO fetch + 배경 제거 + 추론
    - 선행. T002 · 예상. 4h
- [ ] **T004** 색상 추출(k-means 5 클러스터, 최빈 HEX)
    - 선행. T003 · 예상. 1.5h
- [ ] **T005** modelVersion·requestId·신뢰도·처리 시간 구조화 로깅
    - 선행. T003 · 예상. 1h
- [ ] **T006** 배포 (Fly.io 또는 Render 별도 앱)
    - 선행. T005 · 예상. 2h
- [ ] **T007** μsvc 단위 테스트 (모델은 mock, fetch·후처리만)
    - 선행. T003·T004 · 예상. 1.5h

### P2. API 어댑터 결선

- [ ] **T101** `HttpClassifierService` 실 구현체 작성 (apps/api/src/items/classifier.service.ts에 추가)
    - 선행. T006 · 예상. 1h
- [ ] **T102** 타임아웃 5초 + 1회 재시도 + AbortController
    - 선행. T101 · 예상. 1h
- [ ] **T103** items.module.ts에서 NullClassifier ↔ HttpClassifier 환경변수 토글
    - 선행. T101 · 예상. 0.5h
- [ ] **T104** 신뢰도 < 0.5 → category=null 분기 (items.service에서 처리하도록)
    - 선행. T101 · 예상. 0.5h
- [ ] **T105** 타임아웃·5xx 시 백그라운드 재분류 enqueue (큐 인프라는 item-register-api T202 결정과 동일)
    - 선행. T102 + item-register-api T202 · 예상. 2h
- [ ] **T106** HttpClassifierService 단위 테스트 (mock fetch, 타임아웃·재시도)
    - 선행. T102 · 예상. 1h

### P3. 보정 API + 분석

- [ ] **T201** `PATCH /items/:id/category` 컨트롤러·DTO
    - 선행. 없음 · 예상. 1h
- [ ] **T202** ItemsService.updateCategory + 소유자 검증
    - 선행. T201 · 예상. 1h
- [ ] **T203** AnalyticsService에 `classify_corrected` 이벤트 발행 (원래 카테고리·수정 카테고리·신뢰도·modelVersion)
    - 선행. T202 · 예상. 1h
- [ ] **T204** 컨트롤러·서비스 통합 테스트
    - 선행. T203 · 예상. 1.5h

## 아키텍처 다이어그램

```
[NestJS API]                        [Classifier μsvc]                [R2/MinIO]
  │  HttpClassifier.classify(key)     │                                  │
  ├──────────────────────────────────▶│                                  │
  │  (timeout 5s, retry 1)            │  GET key (fetch image)           │
  │                                   ├─────────────────────────────────▶│
  │                                   │◀─────────────────────────────────│
  │                                   │  bgRemove + classify + colorExt  │
  │  { category, top3, color, ... }   │                                  │
  │◀──────────────────────────────────│                                  │
  │                                                                       │
  │  PATCH /items/:id/category (from mobile)                              │
  │  → updateCategory + Analytics.emit(classify_corrected)                │
```

## 테스트 매트릭스

| #   | 케이스                        | 입력                                  | 기대 결과                                            |
| --- | ----------------------------- | ------------------------------------- | ---------------------------------------------------- |
| 1   | 정상 분류                     | 흰 티셔츠 사진                        | category=TOP, top3 길이 3, colorHex 흰색 근사        |
| 2   | 신뢰도 < 0.5                  | 모델이 top1=0.3                       | API가 category=null로 응답, "미분류" Item 저장        |
| 3   | 타임아웃                      | μsvc 6초 응답                         | API가 category=null로 즉시 응답, 재분류 enqueue       |
| 4   | μsvc 5xx                      | 500 응답                              | 1회 재시도 후 category=null                          |
| 5   | 객체 키 없음                  | μsvc가 404                            | API category=null, error 로그                        |
| 6   | PATCH 정상                    | 본인 Item, 다른 카테고리              | 200, classify_corrected 이벤트 1건                   |
| 7   | PATCH 동일 카테고리           | 변경 없음                             | 200, 이벤트 미발행                                   |
| 8   | PATCH 타 사용자 Item          | 다른 userId의 itemId                  | 403                                                  |
