---
name: feature-verify
description: spec.md, plan.md 기반으로 코드 리뷰, 기능 검증, 보안 감사를 수행하고 docs/features/FEATURE_SLUG/review.md를 생성한다. 사용 예. $feature-verify user-login
---

# feature-verify

검증 단계를 시작한다. 본 스킬의 모든 작업은 **현재 Codex 대화에서 직접 수행**한다(서브에이전트 디스패치 없음).

---

## 0. 대상 기능 확인

`사용자 입력`을 feature slug로 사용한다.

- `사용자 입력`이 있으면 그대로 사용한다. 예: `$feature-verify user-login`
- `사용자 입력`이 없으면 사용자에게 묻는다. > 어떤 기능을 검증할까요?

`사용자 입력`이 kebab-case slug 형태가 아닌 자연어/한국어/다른 표기로 보이면 의미를 파악해 후보 slug를 제안하고 사용자에게 확인을 받는다.

> `사용자 입력`은 plan 단계 slug 형식이 아닌 것 같습니다. `후보-slug` 가 맞나요?

`docs/features/$FEATURE_SLUG/` 경로와 구현 완료 여부를 확인한다.

```bash
ls docs/features/$FEATURE_SLUG/spec.md \
   docs/features/$FEATURE_SLUG/plan.md 2>/dev/null \
  && echo "DOCS_OK" || echo "DOCS_MISSING"

cat docs/features/$FEATURE_SLUG/phase.md 2>/dev/null
```

`DOCS_MISSING` 이면 중단한다.

> `docs/features/$FEATURE_SLUG/` 문서를 찾을 수 없습니다. `$feature-plan` 을 먼저 실행하세요.

`phase.md` 가 `implemented` 가 아니면 사용자에게 알린다.

> 구현이 완료되지 않은 것 같습니다. 그대로 진행할까요?

확인된 slug를 `FEATURE_SLUG` 로 사용한다.

---

## 1. 준비

```bash
mkdir -p docs/features/$FEATURE_SLUG
echo "verifying" > docs/features/$FEATURE_SLUG/phase.md
```

기존 `docs/features/$FEATURE_SLUG/review.md` 가 있으면 OPEN 항목 수를 확인한다.

```bash
grep -c "| OPEN |" docs/features/$FEATURE_SLUG/review.md 2>/dev/null || echo "0"
```

출력이 `0` 이면 이미 완료된 리뷰다. 사용자에게 알리고 중단한다.

> 이미 완료된 리뷰가 있습니다. 재실행할까요?

`docs/features/$FEATURE_SLUG/spec.md`, `plan.md` 를 읽는다.

본 단계에서 `spec.md` 와 `plan.md` 는 **입력 전용**이다. 어떤 사유로도 수정·재작성하지 않는다. 본 단계에서는 새로운 기능 코드도 작성하지 않는다. 검증 도중 결함이 발견되면 `review.md` 에 OPEN 항목으로 기록만 하고, 수정은 `$feature-patch` 단계에서 처리한다.

---

## 2. 코드 리뷰

해당 스킬 지침을 로드해 gstack의 `review` 스킬을 호출한다. 완료 후 결과를 수집한다.

이후 `spec.md`, `plan.md` 와 대조해 다음을 추가로 검토한다.

- 각 요구사항의 구현 여부 (`DONE` / `PARTIAL` / `NOT DONE` / `CHANGED`)
- plan.md 태스크 완료 여부
- Spec에 없는 구현 (`SCOPE_CREEP`)
- 테스트 커버리지 (`UNTESTED`)

파일:라인 근거 없이 `DONE` 판정하지 않는다.

---

## 3. 기능 검증

해당 스킬 지침을 로드해 gstack의 `qa-only` 스킬을 호출한다. 완료 후 결과를 수집한다.

---

## 4. 보안 감사

해당 스킬 지침을 로드해 gstack의 `cso` 스킬을 호출한다. 완료 후 결과를 수집한다.

---

## 5. 산출물 저장

결과를 `docs/features/$FEATURE_SLUG/review.md` 에 저장한다.
산출물 템플릿은 스킬 디렉터리의 `templates/review.md` 를 읽고 해당 구조를 그대로 사용한다.
헤더/표 컬럼/순서를 임의로 바꾸지 않고, 각 섹션의 빈 셀과 플레이스홀더만 채운다.

각 표의 `처리상태` 는 `$feature-patch` 의 수집 기준이다.

- 보강이 필요한 행은 `OPEN` 으로 기록한다.
- 보강이 필요 없는 행은 `CLOSED` 로 기록한다.
- 섹션 1의 `판정` 은 `DONE`, `PARTIAL`, `NOT DONE`, `CHANGED` 중 하나로 기록한다.
- 섹션 2의 `판정` 은 `DONE`, `PARTIAL`, `NOT DONE`, `CHANGED`, `SCOPE_CREEP` 중 하나로 기록한다.
- 섹션 3의 `판정` 은 `TESTED`, `PARTIAL`, `UNTESTED` 중 하나로 기록한다.
- 섹션 4의 `분류` 는 `BUG`, `SECURITY`, `QA`, `REGRESSION`, `DX`, `OTHER` 중 하나로 기록한다.
- `PARTIAL`, `NOT DONE`, `SCOPE_CREEP`, `UNTESTED` 는 기본적으로 `OPEN` 으로 기록한다.
- `CHANGED` 는 spec 변경이 필요한 경우 `OPEN` 으로 기록하고, 단순 구현 차이지만 수용 가능한 경우 `CLOSED` 로 기록한다.
- Appendix의 confidence 5 미만 항목도 같은 표 구조를 사용한다. 보강 후보는 `OPEN` 으로 기록하되, `$feature-patch --include-appendix` 를 사용하지 않으면 기본 수집 대상에서 제외된다.
- 모든 `OPEN` 행에는 `심각도` 와 `보강 지시` 를 반드시 채운다.

---

## 6. 완료 보고

```bash
echo "verified" > docs/features/$FEATURE_SLUG/phase.md
```

```
✅ 검증 완료

docs/features/$FEATURE_SLUG/
  └── review.md (생성됨)

SPEC_ITEMS:  DONE {n} / PARTIAL {n} / NOT DONE {n}
PLAN_TASKS:  완료 {n} / 미완료 {n}
UNTESTED:    {n}건
OPEN_ITEMS:  {n}건

결과를 확인하셨나요? 다음 단계는 OPEN 항목 수에 따라 달라집니다.
```

OPEN 항목이 1건 이상이면 보강 안내를 출력한다.

```
🔧 OPEN 항목 {n}건이 남아 있습니다.
`$feature-patch $FEATURE_SLUG` 로 보강하고, 이후 `$feature-verify $FEATURE_SLUG` 를 재실행하세요.
```

OPEN 항목이 0건이면 다음 기능 안내를 출력한다.

```
🎉 OPEN 항목이 없습니다. 본 기능은 검증 완료 상태입니다.
다른 기능을 계획하려면 `$feature-plan 기능 설명` 을 실행하세요.
```

여기서 종료한다.
