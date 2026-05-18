# Plan. 로그인·온보딩 UI 폴리시 (auth-onboarding-ui)

## 단계 구성

| Phase | 이름                    | 목표                                                          |
| ----- | ----------------------- | ------------------------------------------------------------- |
| P1    | 디자인 토큰 + 공통 위젯  | mockup 팔레트·그림자·공용 PrimaryButton·SoftCard 결선.         |
| P2    | 온보딩 핵심 4화면 폴리시 | consent·phone·sms·pin-set 4개 화면 mockup 반영.                |
| P3    | 부가 화면 + 신규 다이얼로그 | biometric 신규 + pin-reset·pin-login·phone-change 폴리시.   |
| P4    | 검증                    | 위젯 테스트·flutter analyze 통과·실기기 1대 수동 확인.          |

## 구현 태스크

### P1. 디자인 토큰 + 공통 위젯

- [ ] **T001** `core/theme/app_colors.dart` 에 mockup 팔레트 추가 (bg·bgSoft·ink·ink2·ink3·line·peach·blue·mint·lavender 각 2색)
    - 선행. 없음 · 예상. 0.5h · 근거. spec F1
- [ ] **T002** `core/theme/app_theme.dart` 에 `cardShadow`·`elevateShadow` BoxShadow 토큰 추가
    - 선행. T001 · 예상. 0.3h
- [ ] **T003** `core/theme/app_typography.dart` 에 mockup 헤딩 스케일 추가 (26pt heading800·14pt body500·12pt caption500)
    - 선행. T001 · 예상. 0.5h
- [ ] **T004** `shared/widgets/primary_button.dart` 신규 — peach 배경·peachInk 텍스트·라운드 14·56px 높이
    - 선행. T001 · 예상. 0.5h
- [ ] **T005** `shared/widgets/soft_card.dart` 신규 — bgSoft 배경·라운드 14·12-14 패딩
    - 선행. T001 · 예상. 0.3h
- [ ] **T006** `shared/widgets/feature_chip.dart` 신규 — 36px 라운드 칩 (peach/mint/blue/lavender 4 variant)
    - 선행. T001 · 예상. 0.5h
- [ ] **T007** 토큰 위젯 unit 테스트 (색·라운드·그림자 값 확인)
    - 선행. T004·T005·T006 · 예상. 1h

### P2. 온보딩 핵심 4화면 폴리시

- [ ] **T101** `onboarding_consent_screen.dart` 재구성 — Tr_OnbConsent 매핑
    - 상단 78px 아이콘 박스 + heading + 4 feature chip + 약관 박스 + PrimaryButton + 로그인 링크
    - 선행. P1 완료 · 예상. 2h · 근거. spec F2
- [ ] **T102** `phone_input_screen.dart` 재구성 — Tr_OnbPhone 매핑
    - 뒤로가기 + heading + 큰 입력 필드(+82 prefix·11자리) + 안내 + PrimaryButton
    - 선행. P1 완료 · 예상. 1.5h · 근거. spec F3
- [ ] **T103** `otp_input_screen.dart` 재구성 — Tr_OnbSms 매핑
    - 6자리 셀 + 60초 카운트다운 + 재전송 버튼 (기존 타이머 로직 유지)
    - 선행. P1 완료 · 예상. 1.5h · 근거. spec F4
- [ ] **T104** `pin_setup_screen.dart` 재구성 — Tr_OnbPinSet 매핑
    - heading + 6 dot indicator + 9칸 키패드 + 안내 텍스트. 설정·확인 2단계 흐름 유지
    - 선행. P1 완료 · 예상. 2h · 근거. spec F5

### P3. 부가 화면 + 신규 다이얼로그

- [ ] **T201** `biometric_prompt_dialog.dart` 신규 위젯 — Tr_OnbBio 매핑
    - 모달, 아이콘, heading, 부제목, "사용하기"/"나중에" 버튼
    - 선행. P1 완료 · 예상. 1.5h · 근거. spec F6
- [ ] **T202** PIN 설정 완료 후 다이얼로그 호출 결선 + 결과를 SecureTokenStorage 플래그에 저장
    - 선행. T104·T201 · 예상. 1h
- [ ] **T203** `pin_reset_screen.dart` 재구성 — Tr_PinReset 매핑
    - 본인 확인 완료 카드(mint) + heading + dot indicator + 키패드 + 경고 텍스트
    - 선행. P1 완료 · 예상. 1.5h · 근거. spec F7
- [ ] **T204** `pin_login_screen.dart` 폴리시 — PIN 설정과 동일 디자인 언어 + 마지막 번호 마스킹 상단 표시
    - 선행. P1 완료 · 예상. 1.5h · 근거. spec F8
- [ ] **T205** `phone_change_screen.dart` 폴리시 — Tr_OnbPhone 동일 + 30일 1회 제한 배너
    - 선행. T102 · 예상. 1h · 근거. spec F9

### P4. 검증

- [ ] **T301** 기존 위젯 테스트가 모두 통과하는지 확인 (회귀 검증)
    - 선행. P2·P3 완료 · 예상. 0.5h
- [ ] **T302** 신규 위젯 테스트 추가 — PrimaryButton·SoftCard·biometric dialog 렌더링
    - 선행. T004·T005·T201 · 예상. 1.5h
- [ ] **T303** `flutter analyze` 0 issue 확인
    - 선행. P2·P3 완료 · 예상. 0.2h
- [ ] **T304** 실기기(또는 시뮬레이터) 1대로 6 화면 시각 확인 — mockup과 색·간격·아이콘 비교
    - 선행. P2·P3 완료 · 예상. 1h
- [ ] **T305** progress.md 갱신 + 잔여 폴리시 항목(예. 다크 모드) 별도 issue 기록
    - 선행. T304 · 예상. 0.3h

## 아키텍처 다이어그램

```
docs/plan/design/mockup/project/src/screens-onboarding.jsx
  │ (디자인 시안)
  ▼
apps/mobile/lib/
  ├── core/theme/
  │     ├── app_colors.dart        ← T001 (팔레트 확장)
  │     ├── app_typography.dart    ← T003 (스케일 추가)
  │     └── app_theme.dart         ← T002 (그림자)
  ├── shared/widgets/              ← T004·T005·T006 (신규 공용 위젯)
  │     ├── primary_button.dart
  │     ├── soft_card.dart
  │     └── feature_chip.dart
  └── features/auth/presentation/  ← P2·P3 (기존 7화면 + 신규 1)
        ├── onboarding_consent_screen.dart      ← T101
        ├── phone_input_screen.dart             ← T102
        ├── otp_input_screen.dart               ← T103
        ├── pin_setup_screen.dart               ← T104
        ├── biometric_prompt_dialog.dart [NEW]  ← T201
        ├── pin_reset_screen.dart               ← T203
        ├── pin_login_screen.dart               ← T204
        └── phone_change_screen.dart            ← T205

(API·Riverpod provider·router 정의는 변경 없음)
```

## 테스트 매트릭스

| #   | 케이스                                | 입력                                    | 기대 결과                                                    |
| --- | ------------------------------------- | --------------------------------------- | ------------------------------------------------------------ |
| 1   | PrimaryButton 렌더                    | label="시작하기"                         | peach 배경·peachInk 텍스트·라운드 14·높이 56                  |
| 2   | SoftCard 렌더                         | child=Text                              | bgSoft 배경·라운드 14·padding 12-14                          |
| 3   | 동의 화면 렌더                        | 위젯 트리                               | 78px 아이콘 박스·heading·4 feature chip·약관 박스·CTA 노출   |
| 4   | 동의 미체크 시 CTA 비활성             | 약관 체크박스 false                      | "시작하기" 버튼 disabled                                     |
| 5   | 전화번호 11자리 미만이면 CTA 비활성    | 입력 "01012345"                          | "인증번호 받기" 버튼 disabled                                |
| 6   | SMS 6자리 자동 완료 → 다음 화면 전이   | OTP "123456" 자동 입력                  | onComplete 콜백 1회 호출, 라우터 push 호출                   |
| 7   | PIN 설정 1단계 완료 → 2단계 자동 전이  | 6 dot 채움                              | 2단계 헤더 "다시 한 번 입력" 노출, dot 초기화                  |
| 8   | 두 PIN 불일치                         | 1단계 123456, 2단계 654321              | 경고 토스트 + 1단계로 복귀                                   |
| 9   | 생체 다이얼로그 "사용하기"            | 디바이스 Face ID 지원                    | SecureTokenStorage 플래그 `biometric_enabled = true`         |
| 10  | 생체 다이얼로그 "나중에"              | -                                       | 플래그 false, 다음 화면 정상 진행                            |
| 11  | 기기 미지원 시 다이얼로그 미노출       | local_auth.canCheckBiometrics = false   | 다이얼로그 skip, 곧장 다음 화면                              |
| 12  | PIN 재설정 흐름                       | SMS 인증 후 진입                         | mint 카드 "본인 확인 완료" 상단 노출, 새 PIN 설정 가능       |
| 13  | 회귀. 기존 위젯 테스트 전부 통과       | `flutter test`                          | 0 fail                                                       |
| 14  | `flutter analyze`                     | 전체 소스                               | 0 issue                                                      |
| 15  | 실기기 시각 확인                      | iPhone 또는 Android 1대                  | mockup과 6 화면 비교 — 색·간격·아이콘 의미적 일치             |
