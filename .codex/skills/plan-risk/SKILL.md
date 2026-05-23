---
name: plan-risk
description: 리스크 점검 단계 오케스트레이션. pre-mortem, test-scenarios를 순차 실행하고 docs/plan/risk/ 경로에 산출물을 저장한다. 사용 예. $plan-risk
---

# plan-risk

리스크 역할을 오케스트레이션한다. "출시했을 때 무엇이 무너질 수 있는가"를 사전에 검증한다.

## 0. 입력 수집

`사용자 입력`이 있으면 컨텍스트로 사용한다. 비어 있으면 다음 우선순위로 입력을 끌어온다.

1. `docs/plan/pm/prd-mvp.md`, `docs/plan/pm/user-stories.md` 가 존재하면 자동 컨텍스트로 사용한다.
2. 없으면 사용자에게 묻는다. > 어떤 출시 계획을 점검할까요? PRD 경로를 알려주세요.

PM 단계 산출물이 없으면 경고하고 진행할지 확인한다.

## 1. 준비

```bash
mkdir -p docs/plan/risk
```

## 2. 실행 순서

| 순서 | 호출 스킬                     | 저장 경로                          | 메모                                    |
| ---- | ----------------------------- | ---------------------------------- | --------------------------------------- |
| 1    | `pm-execution:pre-mortem`     | `docs/plan/risk/pre-mortem.md`     | Tigers·Paper Tigers·Elephants·Go/No-Go  |
| 2    | `pm-execution:test-scenarios` | `docs/plan/risk/test-scenarios.md` | Happy·Edge·Error·Security·Perf 시나리오 |

각 단계 진행 시 사용자에게 짧게 알린다. 예. "1/2. pre-mortem 진행 중."

## 3. 산출물 규칙

- 각 문서 첫 줄에 한국어 역할 주석.
- pre-mortem은 user-stories의 핵심 P0 항목을 기준으로 리스크 도출.
- test-scenarios는 pre-mortem에서 도출된 Launch-Blocking Tigers를 우선 다룬다.
- 모든 문서에 pm·founder 폴더 문서로의 역참조 링크 포함.

## 4. 일관성 점검

작성 후 다음 항목을 점검해 보고한다.

- pre-mortem의 Launch-Blocking Tigers ↔ test-scenarios의 Critical 시나리오가 모두 매핑되었는가.
- 각 Tiger의 mitigation owner와 deadline이 명시되었는가.
- Go/No-Go 체크리스트가 실행 가능한가.

## 5. 완료 보고

2개 문서 링크 + 일관성 점검 결과 + Launch-Blocking Tigers 요약 1줄씩. README.md는 만들지 않는다.

## 6. 다음 단계 안내

> 다음은 `$plan-marketing` 입니다. 출시 GTM 계획과 가치 제안 카피를 작성합니다.
