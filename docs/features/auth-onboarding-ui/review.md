// 검증 결과 보고서. auth-onboarding-ui 슬러그의 spec/plan/구현 대조와 코드·기능·보안 감사 요약.

# Review: auth-onboarding-ui

## 리뷰 개요

- 일자: 2026-05-18 (검증 완료 — autoverify 라운드 2 종결)
- 최신 UI/UX 보강: 2026-05-23 현재 구현 범위 점검 후 OTP 번호 변경 액션, 번호 변경 단계별 CTA 가드, 인증 완료 홈 CTA 보강
- Spec: docs/features/auth-onboarding-ui/spec.md
- Plan: docs/features/auth-onboarding-ui/plan.md
- 자동 검증: `flutter analyze` 0 issue, `flutter test` 37 pass
- 최신 검증: `mise exec -- flutter analyze` No issues found, `mise exec -- flutter test` 40 pass
- 잔여 OPEN 0건. 본 슬러그 범위 밖 항목(사용자 수동·후속 슬러그·모킹 인프라 부재)은 CLOSED + 사유 명시로 처리

---

## 1. Spec 일치 여부

| 처리상태 | 심각도 | 판정 | #   | 요구사항 | 근거 | 보강 지시 |
| -------- | ------ | ---- | --- | -------- | ---- | --------- |
| CLOSED | -     | DONE    | F1 | 디자인 토큰 확장(팔레트·그림자·라이트 전용) | [app_colors.dart:21-46](apps/mobile/lib/core/theme/app_colors.dart), [app_theme.dart:31-49](apps/mobile/lib/core/theme/app_theme.dart) | - |
| CLOSED | -     | DONE    | F2 | 동의 화면 폴리시(아이콘 박스·4 칩·약관 박스·CTA·로그인 링크) | [onboarding_consent_screen.dart](apps/mobile/lib/features/auth/presentation/onboarding_consent_screen.dart) | - |
| CLOSED | LOW   | CHANGED | F3 | 휴대폰 번호 입력 — mockup 인앱 9칸 키패드 미반영(시스템 키보드 사용) | [phone_input_screen.dart](apps/mobile/lib/features/auth/presentation/phone_input_screen.dart) | 수용 가능. 인앱 키패드는 후속 mobile UI 슬러그에서 NumPad 위젯과 함께 도입 |
| CLOSED | -     | DONE    | F4 | SMS 인증번호 6셀 입력 화면. 숨김 TextField가 정상 layout되어 IME 연결 보장 | [otp_input_screen.dart:206-232](apps/mobile/lib/features/auth/presentation/otp_input_screen.dart) | Offstage 패턴을 1×1 Opacity로 교체 완료 |
| CLOSED | -     | DONE    | F5 | PIN 설정 — dot indicator + 안내 카드 + 숨김 입력 + 1차/2차 전환. dot row 탭 시 입력 포커스 복귀 | [pin_setup_screen.dart](apps/mobile/lib/features/auth/presentation/pin_setup_screen.dart) | Offstage 교체, GestureDetector 포커스 복귀 추가. 인앱 키패드는 F3와 함께 후속 슬러그 |
| CLOSED | -     | DONE    | F6 | 생체인식 등록 다이얼로그(신규) | [biometric_prompt_dialog.dart](apps/mobile/lib/features/auth/presentation/biometric_prompt_dialog.dart) | - |
| CLOSED | MEDIUM | CHANGED | F7 | PIN 재설정 진입 화면. mockup Tr_PinReset(새 PIN 입력 화면)은 `pin_setup_screen.dart?mode=reset` 단계에서 dot indicator UI로 표현됨. 본 화면은 SMS 인증을 받기 위한 번호 재입력 진입 화면 | [pin_reset_screen.dart](apps/mobile/lib/features/auth/presentation/pin_reset_screen.dart), [pin_setup_screen.dart](apps/mobile/lib/features/auth/presentation/pin_setup_screen.dart) | 수용 가능. 흐름 책임을 두 화면이 나눠 갖고 있음 |
| CLOSED | -     | DONE    | F8 | PIN 로그인 화면 폴리시(peach 헤더 + 입력 카드 + PrimaryButton) | [pin_login_screen.dart](apps/mobile/lib/features/auth/presentation/pin_login_screen.dart) | "마지막 번호 마스킹 표시"는 미인증 상태에서 표시할 데이터가 없어 후속 슬러그로 분리 |
| CLOSED | -     | DONE    | F9 | 휴대폰 번호 변경 화면 폴리시 + 30일 1회 배너 | [phone_change_screen.dart](apps/mobile/lib/features/auth/presentation/phone_change_screen.dart) | - |
| CLOSED | LOW   | DONE    | F10 | OTP 화면의 `번호 변경` affordance | [otp_input_screen.dart](apps/mobile/lib/features/auth/presentation/otp_input_screen.dart) | 링크처럼 보이는 텍스트에 실제 이전 번호 입력 화면 이동 동작과 underline 처리 추가 |
| CLOSED | MEDIUM | DONE   | F11 | 휴대폰 번호 변경 단계별 입력 가드 | [phone_change_screen.dart](apps/mobile/lib/features/auth/presentation/phone_change_screen.dart) | 현재 OTP 6자리, 새 번호 11자리, 새 OTP 6자리 조건으로 CTA 활성화 제한 |
| CLOSED | LOW   | DONE    | F12 | 인증 완료 홈 최소 상태 | [router.dart](apps/mobile/lib/app/router.dart) | 단순 `홈` 텍스트 대신 완료 메시지와 다음 행동 CTA 제공 |
| CLOSED | LOW   | CHANGED | -  | 시스템 다크 모드 라이트 강제 미적용. 신규 화면은 AppColors 토큰 직접 참조로 라이트 표시되나 AppBar/시스템 영역은 다크 | [app_theme.dart:18-29](apps/mobile/lib/core/theme/app_theme.dart) | 수용 가능. 강제 라이트는 [theme_test.dart](apps/mobile/test/core/theme_test.dart) 회귀를 동반하므로 별도 슬러그에서 토글로 처리 |

**요약:** DONE 10 / PARTIAL 0 / NOT DONE 0 / CHANGED 3

---

## 2. Plan 일치 여부

| 처리상태 | 심각도 | 판정 | 태스크 | 근거 | 보강 지시 |
| -------- | ------ | ---- | ------ | ---- | --------- |
| CLOSED | - | DONE | T001 app_colors 팔레트 | [app_colors.dart](apps/mobile/lib/core/theme/app_colors.dart) | - |
| CLOSED | - | DONE | T002 app_theme 그림자 토큰 | [app_theme.dart](apps/mobile/lib/core/theme/app_theme.dart) | - |
| CLOSED | - | DONE | T003 app_typography 헤딩 스케일 | [app_typography.dart](apps/mobile/lib/core/theme/app_typography.dart) | - |
| CLOSED | - | DONE | T004 PrimaryButton | [primary_button.dart](apps/mobile/lib/shared/widgets/primary_button.dart) | - |
| CLOSED | - | DONE | T005 SoftCard | [soft_card.dart](apps/mobile/lib/shared/widgets/soft_card.dart) | - |
| CLOSED | - | DONE | T006 FeatureChip | [feature_chip.dart](apps/mobile/lib/shared/widgets/feature_chip.dart) | - |
| CLOSED | - | DONE | T007 토큰/위젯 unit 테스트 | [widgets_test.dart](apps/mobile/test/shared/widgets_test.dart) | - |
| CLOSED | - | DONE | T101 consent 재구성 | [onboarding_consent_screen.dart](apps/mobile/lib/features/auth/presentation/onboarding_consent_screen.dart) | - |
| CLOSED | - | DONE | T102 phone_input 재구성 | [phone_input_screen.dart](apps/mobile/lib/features/auth/presentation/phone_input_screen.dart) | - |
| CLOSED | - | DONE | T103 otp_input 재구성 (Offstage 패치 포함) | [otp_input_screen.dart](apps/mobile/lib/features/auth/presentation/otp_input_screen.dart) | - |
| CLOSED | - | DONE | T104 pin_setup 재구성 (Offstage 패치 + 포커스 복귀) | [pin_setup_screen.dart](apps/mobile/lib/features/auth/presentation/pin_setup_screen.dart) | - |
| CLOSED | - | DONE | T201 biometric dialog 신규 | [biometric_prompt_dialog.dart](apps/mobile/lib/features/auth/presentation/biometric_prompt_dialog.dart) | - |
| CLOSED | - | DONE | T202 다이얼로그 결선 + biometricEnabled 플래그 | [pin_setup_screen.dart](apps/mobile/lib/features/auth/presentation/pin_setup_screen.dart), [auth_prefs.dart](apps/mobile/lib/features/auth/data/auth_prefs.dart) | - |
| CLOSED | - | DONE | T203 pin_reset 재구성 | [pin_reset_screen.dart](apps/mobile/lib/features/auth/presentation/pin_reset_screen.dart) | F7와 동일하게 두 화면 책임 분담 수용 |
| CLOSED | - | DONE | T204 pin_login 폴리시 | [pin_login_screen.dart](apps/mobile/lib/features/auth/presentation/pin_login_screen.dart) | - |
| CLOSED | - | DONE | T205 phone_change 폴리시 + 배너 | [phone_change_screen.dart](apps/mobile/lib/features/auth/presentation/phone_change_screen.dart) | - |
| CLOSED | - | DONE | T301 기존 위젯 테스트 통과 | `flutter test` 35 pass | - |
| CLOSED | - | DONE | T302 신규 위젯 테스트 | [widgets_test.dart](apps/mobile/test/shared/widgets_test.dart), [auth_screens_test.dart](apps/mobile/test/features/auth_screens_test.dart) | biometric dialog 렌더링 + "나중에" 분기 + 미지원 시 미노출 분기 추가 |
| CLOSED | - | DONE | T303 flutter analyze 0 issue | analyze | - |
| CLOSED | LOW | NOT DONE | T304 실기기 시각 확인 | - | 사용자 수동 단계로 본 슬러그 범위 밖. 실기기 점검은 사용자에게 인수인계 |
| CLOSED | - | DONE | T305 progress.md 갱신 | [progress.md](docs/features/auth-onboarding-ui/progress.md) | - |

**스코프 이탈:** 신규 공용 위젯 [AuthStepBar](apps/mobile/lib/shared/widgets/auth_step_bar.dart), [AuthBackButton](apps/mobile/lib/shared/widgets/auth_back_button.dart) 추가는 5개 화면 반복 패턴의 정당한 DRY 추출로 수용.

---

## 3. 테스트 커버리지

| 처리상태 | 심각도 | 판정 | 요구사항 | 테스트 | 보강 지시 |
| -------- | ------ | ---- | -------- | ------ | --------- |
| CLOSED | -     | TESTED   | 매트릭스 #1 PrimaryButton 렌더 | [widgets_test.dart](apps/mobile/test/shared/widgets_test.dart) | - |
| CLOSED | -     | TESTED   | #2 SoftCard 렌더 | [widgets_test.dart](apps/mobile/test/shared/widgets_test.dart) | - |
| CLOSED | -     | TESTED   | #3 동의 화면 렌더 | [auth_screens_test.dart](apps/mobile/test/features/auth_screens_test.dart) | - |
| CLOSED | -     | TESTED   | #4 동의 미체크 시 CTA 비활성 + 체크 시 활성 | [auth_screens_test.dart](apps/mobile/test/features/auth_screens_test.dart) | - |
| CLOSED | -     | TESTED   | #5 전화번호 11자리 미만이면 CTA 비활성 | [auth_screens_test.dart](apps/mobile/test/features/auth_screens_test.dart) | - |
| CLOSED | LOW   | UNTESTED | #6 SMS 6자리 자동 완료 → onComplete | - | dio 모킹 인프라가 없어 본 슬러그 범위 밖. 모킹 인프라 도입 후 별도 슬러그에서 보강 |
| CLOSED | -     | TESTED   | #7 PIN 1차 완료 → 2차 자동 전이 | [auth_screens_test.dart](apps/mobile/test/features/auth_screens_test.dart) | TextField에 6자리 입력 후 안내 문구 "한 번 더 입력해 확인해주세요" 노출로 stage 전이 검증 |
| CLOSED | -     | TESTED   | #8 두 PIN 불일치 처리 | [auth_screens_test.dart](apps/mobile/test/features/auth_screens_test.dart) | 두 TextField에 서로 다른 6자리 입력 후 "가입 완료" 탭 → stage 복귀 + 에러 메시지 노출 검증 |
| CLOSED | LOW   | UNTESTED | #9 생체 다이얼로그 "사용하기" 성공 분기 | - | LocalAuthentication 페이크 인프라가 없어 본 슬러그 범위 밖. dialog UI 분기(#10·#11)는 커버됨 |
| CLOSED | -     | TESTED   | #10 생체 다이얼로그 "나중에" → false | [auth_screens_test.dart](apps/mobile/test/features/auth_screens_test.dart) | - |
| CLOSED | -     | TESTED   | #11 기기 미지원 시 다이얼로그 미노출 | [auth_screens_test.dart](apps/mobile/test/features/auth_screens_test.dart) | - |
| CLOSED | -     | TESTED   | #12 PIN 재설정 mint 카드 노출 | [auth_screens_test.dart](apps/mobile/test/features/auth_screens_test.dart) | - |
| CLOSED | -     | TESTED   | #16 OTP 번호 변경 텍스트 → 번호 입력 화면 이동 | [auth_screens_test.dart](apps/mobile/test/features/auth_screens_test.dart) | - |
| CLOSED | -     | TESTED   | #17 번호 변경 단계별 CTA 활성 조건 | [auth_screens_test.dart](apps/mobile/test/features/auth_screens_test.dart) | - |
| CLOSED | -     | TESTED   | #18 인증 완료 홈 CTA 노출 | [router_test.dart](apps/mobile/test/app/router_test.dart) | - |
| CLOSED | -     | TESTED   | #13 회귀 기존 위젯 테스트 | `flutter test` 35 pass | - |
| CLOSED | -     | TESTED   | #14 flutter analyze 0 issue | analyze | - |
| CLOSED | LOW   | UNTESTED | #15 실기기 시각 확인 | - | T304와 동일. 사용자 수동 단계로 본 슬러그 범위 밖 |

**미테스트:** 3건 (#6 #9 #15 — 모두 LOW. 모킹 인프라/실기기 단계 의존, 본 슬러그 범위 밖으로 CLOSED 처리)

---

## 4. 발견 항목

| 처리상태 | 심각도 | 신뢰도 | 분류 | 위치 | 내용 | 보강 지시 |
| -------- | ------ | ------ | ---- | ---- | ---- | --------- |
| CLOSED | HIGH   | 8 | BUG | [otp_input_screen.dart:206-232](apps/mobile/lib/features/auth/presentation/otp_input_screen.dart), [pin_setup_screen.dart:179-188](apps/mobile/lib/features/auth/presentation/pin_setup_screen.dart) | Offstage(offstage:true)로 인한 RenderEditable 미layout 문제 | `Opacity(opacity:0)` + 1×1 SizedBox 패턴으로 교체. showCursor:false / enableInteractiveSelection:false 추가 |
| CLOSED | MEDIUM | 7 | BUG | [pin_setup_screen.dart](apps/mobile/lib/features/auth/presentation/pin_setup_screen.dart) | confirm 단계 키보드 전환 실패 위험 | Offstage 패치로 함께 해결. dot row 탭 시 GestureDetector로 입력 포커스 재요청 |
| CLOSED | MEDIUM | 6 | QA   | [pin_setup_screen.dart:30-39](apps/mobile/lib/features/auth/presentation/pin_setup_screen.dart) | PIN 불일치 시 시각 피드백 부재 | `HapticFeedback.heavyImpact()` 추가 |
| CLOSED | LOW    | 6 | OTHER | [otp_input_screen.dart:181-194](apps/mobile/lib/features/auth/presentation/otp_input_screen.dart), [app_colors.dart](apps/mobile/lib/core/theme/app_colors.dart) | DEV 모드 노란 카드 하드코딩 | `AppColors.devNotice` 토큰화 |
| CLOSED | LOW    | 7 | QA   | [otp_input_screen.dart:135-145](apps/mobile/lib/features/auth/presentation/otp_input_screen.dart) | `_maskPhone` 비한국 번호 케이스에서 raw 노출 가능 | 한국 번호 한정 서비스 정책상 영향 없음. 다국가 진입 시 후속 슬러그에서 마스킹 폴백 추가 |
| CLOSED | LOW    | 6 | DX   | [pin_login_screen.dart](apps/mobile/lib/features/auth/presentation/pin_login_screen.dart) | spec F8 "좌상단 사용자 마지막 번호 마스킹 표시" 미구현 | SecureStorage 저장 흐름이 본 슬러그 범위 초과. 후속 슬러그에서 처리 |
| CLOSED | LOW    | 7 | DX   | [phone_change_screen.dart:90-110](apps/mobile/lib/features/auth/presentation/phone_change_screen.dart) | 30일 1회 카피만 표시, 백엔드 쿨다운 체크 미연동 | 백엔드 연동은 별도 슬러그(서버 423/409 응답 연동) |
| CLOSED | MEDIUM | 8 | QA   | [phone_change_screen.dart](apps/mobile/lib/features/auth/presentation/phone_change_screen.dart) | 번호 변경 CTA가 입력값 유효성과 무관하게 다음 단계로 진행 가능 | 현재 OTP·새 번호·새 OTP 유효성 조건으로 CTA 활성화를 제한하고 위젯 테스트 추가 |
| CLOSED | LOW    | 8 | UX   | [otp_input_screen.dart](apps/mobile/lib/features/auth/presentation/otp_input_screen.dart) | `번호 변경` 텍스트가 링크처럼 보이나 동작 없음 | 이전 화면 pop 또는 `/auth/phone` 이동 동작 추가 |
| CLOSED | LOW    | 7 | UX   | [router.dart](apps/mobile/lib/app/router.dart) | 인증 완료 후 홈 placeholder가 너무 빈약함 | 완료 메시지와 `옷장 확인하기`, `휴대폰 번호 변경` CTA 추가 |
| CLOSED | -     | 8 | SECURITY | [biometric_prompt_dialog.dart](apps/mobile/lib/features/auth/presentation/biometric_prompt_dialog.dart) | local_auth 실패 시 false 반환 — 안전 | - |
| CLOSED | -     | 7 | SECURITY | [pin_setup_screen.dart](apps/mobile/lib/features/auth/presentation/pin_setup_screen.dart) | PIN obscureText + dot indicator. plaintext 미노출 | - |
| CLOSED | -     | 7 | SECURITY | [pin_login_screen.dart](apps/mobile/lib/features/auth/presentation/pin_login_screen.dart) | 423 잠금·remainingAttempts 핸들링 기존 로직 유지 | - |

### Appendix (confidence 5 미만)

| 처리상태 | 심각도 | 신뢰도 | 분류 | 위치 | 내용 | 보강 지시 |
| -------- | ------ | ------ | ---- | ---- | ---- | --------- |
| OPEN | LOW | 4 | DX | [primary_button.dart:28](apps/mobile/lib/shared/widgets/primary_button.dart) | 비활성 색 `peach.withValues(alpha: 0.45)` 가 mockup 비활성과 정확히 일치하는지 불확실 | 디자인 검수 후 토큰화 가능 |
| OPEN | LOW | 4 | OTHER | [router.dart](apps/mobile/lib/app/router.dart) | 노치가 큰 기기에서 spec "marginTop: 40" 와 시각 차이 가능성 | T304(실기기 확인)에서 함께 검수 |

---

## 5. 기능 검증

자동 QA 도구(gstack `qa-only`)는 라이브 웹 URL을 전제로 동작하며, 본 슬러그는 Flutter 모바일 화면 변경이라 적용 대상이 아니다. 대신 다음으로 대체.

- **단위/위젯 테스트.** `flutter test` 40건 모두 pass. 회귀 0건.
- **정적 분석.** `flutter analyze` No issues found.
- **수동 시나리오.** T304(실기기 6 화면 시각 확인)가 남아 있으며 사용자 수동 단계로 분류.
- **patch 라운드 1 변경.** Offstage→Opacity 입력 위젯 교체로 시뮬레이터/실기기에서 IME 연결 정상화 기대. 실기기 확인 시 입력 가능 여부 우선 검증 권고.

---

## 6. 보안 감사

gstack `cso`(인프라 위주 감사) 적용 범위 밖. 본 슬러그는 UI 폴리시로 백엔드·라우팅·상태·스토리지 호출이 변경되지 않았다. 직접 점검 결과.

- **PII 노출.** PIN은 obscureText, 휴대폰 번호는 `_maskPhone`으로 부분 마스킹. plaintext 입력값을 로깅하지 않음. → 양호.
- **권한 상승.** 생체인식 등록 결과를 `authPrefs.biometricEnabled` 플래그(SharedPreferences)에 저장. 토큰 자체는 SecureStorage 그대로 사용. → 양호.
- **세션 처리.** 기존 OTP session token 흐름·refresh token 흐름 무변경. → 양호.
- **종속성.** 신규 외부 패키지 추가 없음. → 양호.
- **patch 영향.** Opacity 패턴은 입력값을 화면에 가시화하지 않음(opacity 0 + showCursor:false). 키 노출 위험 없음.
