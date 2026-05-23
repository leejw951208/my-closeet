# Progress. auth-onboarding-ui

- 최근 업데이트. 2026-05-23
- 현재 단계. 구현 + 현재 구현 범위 UI/UX 보강 완료

## 태스크 상태

### P1. 디자인 토큰 + 공통 위젯

- [x] T001 app_colors.dart 팔레트 확장
- [x] T002 app_theme.dart 그림자 토큰
- [x] T003 app_typography.dart 헤딩 스케일
- [x] T004 shared/widgets/primary_button.dart
- [x] T005 shared/widgets/soft_card.dart
- [x] T006 shared/widgets/feature_chip.dart
- [x] T007 토큰/위젯 unit 테스트

### P2. 온보딩 핵심 4화면 폴리시

- [x] T101 onboarding_consent_screen.dart 재구성
- [x] T102 phone_input_screen.dart 재구성
- [x] T103 otp_input_screen.dart 재구성
- [x] T104 pin_setup_screen.dart 재구성

### P3. 부가 화면 + 신규 다이얼로그

- [x] T201 biometric_prompt_dialog.dart 신규
- [x] T202 PIN 설정 후 다이얼로그 호출 결선
- [x] T203 pin_reset_screen.dart 재구성
- [x] T204 pin_login_screen.dart 폴리시
- [x] T205 phone_change_screen.dart 폴리시

### P4. 검증

- [x] T301 기존 위젯 테스트 통과
- [x] T302 신규 위젯 테스트 추가
- [x] T303 flutter analyze 0 issue
- [ ] T304 실기기 시각 확인 (수동, 사용자 단계)
- [x] T305 progress.md 갱신 (본 문서)

## 보강 기록

### 2026-05-23. 현재 구현 범위 UI/UX 점검 반영

- `otp_input_screen.dart`의 `번호 변경` 텍스트에 실제 이동 동작을 연결하고 underline affordance를 추가했다.
- `phone_change_screen.dart`의 단계별 CTA를 입력 유효성에 맞게 잠갔다. 현재 번호 OTP 6자리, 새 번호 `010` 11자리, 새 번호 OTP 6자리 조건이 충족되어야 다음 단계로 진행된다.
- `router.dart`의 인증 완료 홈 placeholder를 완료 메시지와 다음 행동 CTA가 있는 최소 홈 상태로 개선했다.
- `auth_screens_test.dart`, `router_test.dart`에 OTP 번호 변경 이동, 번호 변경 CTA 가드, 인증 완료 홈 CTA 테스트를 추가했다.
- 검증 결과. `mise exec -- flutter analyze` No issues found, `mise exec -- flutter test` 40개 PASS.
