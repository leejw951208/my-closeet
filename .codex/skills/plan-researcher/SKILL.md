---
name: plan-researcher
description: 리서치 단계 오케스트레이션. discover, research-users, competitive-analysis를 순차 실행하고 docs/plan/researcher/ 경로에 산출물을 저장한다. 사용 예. $plan-researcher 옷장 앱
---

# plan-researcher

리서치 역할을 오케스트레이션한다. "사용자와 시장의 진짜 모습"을 파악하는 것이 목적이다.

## 0. 입력 수집

`사용자 입력`을 제품·아이디어 설명으로 사용한다.

- 비어 있으면 사용자에게 묻는다. > 어떤 제품·아이디어를 리서치할까요?

## 1. 준비

```bash
mkdir -p docs/plan/researcher
```

## 2. 실행 순서

본 스킬은 다음 PM 스킬을 **순차** 호출한다. 각 스킬의 결과를 받아 `docs/plan/researcher/` 아래 지정 파일명으로 저장한다.

| 순서 | 호출 스킬                                 | 저장 경로                                     |
| ---- | ----------------------------------------- | --------------------------------------------- |
| 1    | `pm-product-discovery:discover`           | `docs/plan/researcher/discovery-plan.md`      |
| 2    | `pm-market-research:research-users`       | `docs/plan/researcher/user-personas.md`       |
| 3    | `pm-market-research:competitive-analysis` | `docs/plan/researcher/competitor-analysis.md` |

각 단계 진행 시 사용자에게 짧게 알린다. 예. "1/3. discovery 진행 중."

## 3. 산출물 규칙

- 각 문서 첫 줄에 한국어 역할 주석(`<!-- ... -->`)을 둔다.
- 본문 상단에 `**Date.** YYYY-MM-DD` 표기.
- 모든 문서에 "관련 문서" 섹션을 두어 같은 폴더 내 다른 산출물을 링크한다.
- 가설/확정 confidence를 명시한다.

## 4. 완료 보고

3개 문서 경로를 마크다운 링크로 나열하고, 핵심 결론 3줄을 요약한다. README.md는 만들지 않는다.

## 5. 다음 단계 안내

> 다음은 `$plan-founder` 입니다. 리서치 결과를 입력으로 전략·수익 모델을 정의합니다.
