---
name: plan-founder
description: 전략·사업 모델 단계 오케스트레이션. business-model startup, pricing, north-star를 순차 실행하고 docs/plan/founder/ 경로에 산출물을 저장한다. 사용 예. $plan-founder
---

# plan-founder

Founder 역할을 오케스트레이션한다. "무엇을 누구에게 어떻게 팔아 어떤 성과를 만드는가"를 정의한다.

## 0. 입력 수집

`사용자 입력`이 있으면 제품 컨텍스트로 사용한다. 비어 있으면 다음 우선순위로 입력을 끌어온다.

1. `docs/plan/researcher/` 의 3개 문서가 존재하면 자동으로 컨텍스트로 사용한다.
2. 없으면 사용자에게 묻는다. > 어떤 제품의 전략을 정리할까요? 리서치 문서가 있다면 경로를 알려주세요.

## 1. 준비

```bash
mkdir -p docs/plan/founder
```

## 2. 실행 순서

| 순서 | 호출 스킬                                           | 저장 경로                             | 메모                                      |
| ---- | --------------------------------------------------- | ------------------------------------- | ----------------------------------------- |
| 1    | `pm-product-strategy:business-model` (startup 모드) | `docs/plan/founder/startup-canvas.md` | 비전·세그먼트·트레이드오프·수익 모델 통합 |
| 2    | `pm-product-strategy:pricing-strategy`                       | `docs/plan/founder/pricing.md`        | 가격 정책·민감도·경쟁사 비교              |
| 3    | `pm-marketing-growth:north-star-metric`                    | `docs/plan/founder/north-star.md`     | 북극성·Input Metric·Counter-Metric        |

각 단계 진행 시 사용자에게 짧게 알린다. 예. "2/3. pricing 진행 중."

## 3. 산출물 규칙

- 각 문서 첫 줄에 한국어 역할 주석(`<!-- ... -->`).
- 본문 상단 `**Date.** YYYY-MM-DD`.
- 다음 문서가 이전 문서의 결론을 참조하도록 일관성을 맞춘다. 특히 pricing은 startup-canvas의 Revenue Streams와, north-star는 startup-canvas의 Key Metrics와 정렬한다.
- 모든 문서에 `docs/plan/researcher/` 문서로의 역참조 링크 포함.

## 4. 일관성 점검

3개 문서 작성 후 다음 항목을 점검해 보고한다.

- startup-canvas의 Revenue Streams ↔ pricing의 가격 포인트가 일치하는가.
- startup-canvas의 Key Metrics ↔ north-star의 NSM이 일치하는가.
- 트레이드오프와 가격·지표 사이에 모순은 없는가.

불일치가 있으면 사용자에게 알리고 수정 옵션을 제안한다.

## 5. 완료 보고

3개 문서 링크 + 일관성 점검 결과 + 핵심 결론 3줄. README.md는 만들지 않는다.

## 6. 다음 단계 안내

> 다음은 `$plan-pm` 입니다. 전략·지표를 PRD·유저 스토리·OKR로 구체화합니다.
