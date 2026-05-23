---
name: plan-marketing
description: 마케팅·GTM 단계 오케스트레이션. gtm-strategy, value-proposition을 순차 실행하고 docs/plan/marketing/ 경로에 산출물을 저장한다. 사용 예. $plan-marketing
---

# plan-marketing

마케팅·GTM 역할을 오케스트레이션한다. "누구에게 어떤 메시지로 어떤 채널로 닿을 것인가"를 정의한다.

## 0. 입력 수집

`사용자 입력`이 있으면 컨텍스트로 사용한다. 비어 있으면 다음 우선순위로 입력을 끌어온다.

1. `docs/plan/founder/`, `docs/plan/researcher/`, `docs/plan/pm/`, `docs/plan/risk/` 의 문서가 존재하면 자동 컨텍스트로 사용한다.
2. 누락 시 사용자에게 경고하고 진행할지 확인한다.

## 1. 준비

```bash
mkdir -p docs/plan/marketing
```

## 2. 실행 순서

| 순서 | 호출 스킬                               | 저장 경로                                  | 메모                                             |
| ---- | --------------------------------------- | ------------------------------------------ | ------------------------------------------------ |
| 1    | `pm-go-to-market:gtm-strategy`           | `docs/plan/marketing/gtm-plan.md`          | 비치헤드·ICP·채널·일정·KPI                       |
| 2    | `pm-product-strategy:value-proposition` | `docs/plan/marketing/value-proposition.md` | LP·앱스토어·광고 카피용 한 줄 가치 (6-part JTBD) |

각 단계 진행 시 사용자에게 짧게 알린다. 예. "2/2. value-proposition 진행 중."

## 3. 산출물 규칙

- 각 문서 첫 줄에 한국어 역할 주석.
- gtm-plan의 Success Metrics는 founder/north-star.md의 NSM·Input Metric과 정렬한다.
- gtm-plan의 비치헤드 ICP는 researcher/user-personas.md의 Primary Persona와 일치한다.
- value-proposition은 gtm-plan의 비치헤드를 대상으로 6-part 템플릿(Who·Why·What before·How·What after·Alternatives)을 채운다.
- pre-mortem에서 도출된 GTM 관련 리스크(예. 인플루언서 확산, 광고 CAC)를 gtm-plan의 Risks 섹션에 반영.
- 모든 문서에 다른 단계 폴더 문서로의 역참조 링크 포함.

## 4. 일관성 점검

작성 후 다음 항목을 점검해 보고한다.

- gtm-plan KPI ↔ north-star NSM·Input Metric 정렬.
- gtm-plan 비치헤드 ↔ user-personas Primary Persona 일치.
- value-proposition의 Alternatives ↔ competitor-analysis 핵심 경쟁사 일치.

## 5. 완료 보고

2개 문서 링크 + 일관성 점검 결과 + 한 줄 포지셔닝 문장 발췌. README.md는 만들지 않는다.

## 6. 다음 단계 안내

> 모든 기획 단계가 완료되었습니다. 이제 출시 준비(베타·심사·인플루언서 콘텐츠)와 개발 실행(`$feature-plan` 으로 첫 기능부터 시작)으로 넘어갑니다.
