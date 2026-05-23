---
name: plan-pm
description: PM 실행 정의 단계 오케스트레이션. setup-metrics, create-prd, user-stories, brainstorm-okrs를 순차 실행하고 docs/plan/pm/ 경로에 산출물을 저장한다. 사용 예. $plan-pm
---

# plan-pm

PM 역할을 오케스트레이션한다. "무엇을 어디까지 만들고 어떻게 측정할 것인가"를 정의한다.

## 0. 입력 수집

`사용자 입력`이 있으면 컨텍스트로 사용한다. 비어 있으면 다음 우선순위로 입력을 끌어온다.

1. `docs/plan/founder/` 와 `docs/plan/researcher/` 의 문서들이 존재하면 자동으로 컨텍스트로 사용한다.
2. 없으면 사용자에게 묻는다. > 어떤 제품의 PM 산출물을 만들까요?

선행 문서가 누락되었으면 경고하고 진행할지 확인한다.

## 1. 준비

```bash
mkdir -p docs/plan/pm
```

## 2. 실행 순서

| 순서 | 호출 스킬                                | 저장 경로                           |
| ---- | ---------------------------------------- | ----------------------------------- |
| 1    | `pm-product-discovery:setup-metrics`     | `docs/plan/pm/metrics-dashboard.md` |
| 2    | `pm-execution:create-prd`                 | `docs/plan/pm/prd-mvp.md`           |
| 3    | `pm-execution:user-stories` (user 포맷) | `docs/plan/pm/user-stories.md`      |
| 4    | `pm-execution:brainstorm-okrs`                 | `docs/plan/pm/okrs.md`              |

각 단계 진행 시 사용자에게 짧게 알린다. 예. "3/4. user-stories 진행 중."

## 3. 산출물 규칙

- 각 문서 첫 줄에 한국어 역할 주석.
- PRD의 Success Metrics는 founder의 north-star.md와 정렬한다.
- user-stories는 PRD의 P0·P1 요구사항과 1:1 매핑되어야 한다.
- OKR의 Key Result는 metrics-dashboard의 Input Metric에서 파생한다.
- 모든 문서에 founder·researcher 폴더 문서로의 역참조 링크 포함.

## 4. 일관성 점검

작성 후 다음 항목을 점검해 보고한다.

- PRD Success Metrics ↔ north-star NSM·Input Metric 정렬.
- user-stories ↔ PRD 요구사항 누락 없는지.
- OKR Key Result ↔ metrics-dashboard 측정 가능 여부.

## 5. 완료 보고

4개 문서 링크 + 일관성 점검 결과 + 핵심 결론 3줄. README.md는 만들지 않는다.

## 6. 다음 단계 안내

> 다음은 `$plan-risk` 입니다. 출시 전 리스크 점검과 QA 시나리오를 작성합니다.
