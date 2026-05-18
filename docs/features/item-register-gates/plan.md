# Plan. 옷 등록 게이트 검증 (item-register-gates)

## 단계 구성

| Phase | 이름            | 목표                                                   |
| ----- | --------------- | ------------------------------------------------------ |
| P1    | T1 정확도       | 회귀 셋 수집·자동 측정·임계값 검증 보고.                |
| P2    | T4 등록 시간    | 실기기 3종 인스트루먼트·측정·보고.                      |
| P3    | /classify 부하   | k6 시나리오·1,000 동시 요청·임계값 검증 보고.           |
| P4    | 분석 이벤트 확인 | 3종 이벤트 수신 체크리스트.                            |

## 구현 태스크

### P1. T1 정확도

- [ ] **T001** 회귀 셋 100장 수집(8 카테고리 × 12~13장, 공개 셋 + 자가 촬영)
    - 선행. item-register-ai T006 완료(μsvc 배포) · 예상. 4h
- [ ] **T002** 라벨 JSON 작성 (`regression-set/labels.json`)
    - 선행. T001 · 예상. 1h
- [ ] **T003** 자동 측정 스크립트 (`scripts/measure-classify-accuracy.ts`)
    - 선행. T002 · 예상. 2h
- [ ] **T004** 보고서 `reports/t1-{date}.md` 작성. Top-1·Top-3·카테고리별 분포
    - 선행. T003 · 예상. 1h

### P2. T4 등록 시간

- [ ] **T101** Flutter에 등록 흐름 타이머 추가 (item-register-mobile에 작은 PR)
    - 선행. item-register-mobile T010 · 예상. 1h
- [ ] **T102** 실기기 3종 준비 (iOS 표준급·Android 저/고사양)
    - 선행. T101 · 예상. 1h
- [ ] **T103** 기기당 10회 등록·측정 (배경 제거 포함 카메라 진입~결과)
    - 선행. T102 · 예상. 2h
- [ ] **T104** 보고서 `reports/t4-{date}.md`. 평균·P50·P95 + 통과/미달 판정
    - 선행. T103 · 예상. 1h

### P3. /classify 부하

- [ ] **T201** k6 스크립트 작성 (`scripts/classify-load.js`). 회귀 셋 100장 순환
    - 선행. item-register-ai T006 · 예상. 1.5h
- [ ] **T202** 스테이징 μsvc 대상 1,000 vu 부하 실행
    - 선행. T201 · 예상. 1h
- [ ] **T203** 보고서 `reports/classify-load-{date}.md`. P95·에러율·CPU 사용량
    - 선행. T202 · 예상. 1h

### P4. 분석 이벤트 확인

- [ ] **T301** 분석 이벤트 정의 3종 결선 확인 (item_registered·classify_corrected·batch_failed)
    - 선행. item-register-mobile T009·T202·item-register-ai T203 · 예상. 0.5h
- [ ] **T302** 인위 발생 + 수신 확인 + 체크리스트 작성
    - 선행. T301 · 예상. 1h

## 아키텍처 다이어그램

```
[Regression set 100 imgs] ──▶ scripts/measure-classify-accuracy.ts ──▶ /classify
                                            │
                                            ▼
                                   reports/t1-{date}.md (Top-1/Top-3)

[Real device × 3]  ──▶  Flutter timer event ──▶ Sentry/Analytics
                                            │
                                            ▼
                                   reports/t4-{date}.md (mean/p50/p95)

[k6 1,000 vu] ──▶ /classify ──▶ reports/classify-load-{date}.md (p95, err%)

[App events] ──▶ Analytics ──▶ reports/analytics-{date}.md (checklist)
```

## 테스트 매트릭스

| #   | 게이트 | 입력                                      | 통과 기준                            |
| --- | ------ | ----------------------------------------- | ------------------------------------ |
| 1   | T1     | 회귀 셋 100장                              | Top-1 ≥80%, Top-3 ≥95%               |
| 2   | T4     | 실기기 3종 × 10회                          | 평균 ≤8초, /classify P95 ≤2초         |
| 3   | NFR    | k6 1,000 vu                                | /classify P95 ≤2초, 에러율 ≤0.5%      |
| 4   | 분석   | 등록·수정·배치 실패 각 1회                  | 3종 이벤트 모두 수신 (Amplitude 콘솔) |
