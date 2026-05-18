# Spec. 로그인·온보딩 UI 폴리시 (auth-onboarding-ui)

> 한 줄 요약. 이미 동작하는 가입·로그인 흐름의 7개 화면을 mockup 시안(`docs/plan/design/mockup/project/src/screens-onboarding.jsx` + 디자인 토큰)에 맞춰 비주얼·인터랙션을 다듬는다.

## 배경

`auth-login` 슬러그에서 휴대폰 SMS OTP + PIN + 생체인식 흐름의 기능 구현은 완료됐다(보강 1라운드 통과). 그러나 현재 UI는 기능 우선 단순 폼이라 mockup이 제안하는 따뜻한 파스텔 톤·낙천적 일러스트·계층적 타이포 시스템과 거리가 있다.

본 슬러그는 백엔드·라우팅·상태 관리는 일절 건드리지 않고, **`apps/mobile/lib/features/auth/presentation/` 의 7개 화면 위젯과 공통 디자인 토큰만** mockup에 맞게 재구성한다. 기능 회귀가 없어야 하므로 모든 위젯 테스트(있다면)는 그대로 통과해야 한다.

## 기능 목록

### F1. 디자인 토큰 확장

mockup의 컬러 팔레트·그림자·라운드를 `core/theme/` 토큰에 추가한다.

**동작 방식**

- `app_colors.dart` 에 mockup 팔레트 추가. `bg(#FFFFFF)`·`bgSoft(#F6F4EE)`·`ink(#1A1A18)`·`ink2(#737067)`·`ink3(#B5B2A8)`·`line(#EEEAE2)`.
- 파스텔 칩 4색. `peach(#FBCFA8)·peachInk(#7A4119)`·`blue(#CFDEEF)·blueInk(#2D4F7B)`·`mint(#D9E8DC)·mintInk(#3D6E50)`·`lavender(#E3DCEF)·lavenderInk(#5C4080)`.
- Primary CTA = peach (warm·on-brand).
- `app_theme.dart` 에 두 그림자 토큰 추가. `cardShadow`, `elevateShadow`.

**포함 범위**

- 라이트 모드만. mockup은 라이트만 제공.

**제외 범위**

- 다크 모드 팔레트 재정의. → mockup 후속 작업.

### F2. 온보딩 동의 화면 폴리시

`onboarding_consent_screen.dart` 를 `Tr_OnbConsent` (screens-onboarding.jsx:13) 에 맞게 재구성.

**동작 방식**

- 상단. 78px 둥근 사각형(peach)에 옷걸이 아이콘 + 26pt heading "내 옷장을 휴대폰 속으로" + 14pt 부제목.
- 중단. 4개 특징 카드 리스트(각 36px 컬러 칩 + 14pt 제목 + 12pt 설명). peach·mint·blue·lavender 순서.
- 하단. 약관 동의 박스(`bgSoft` 배경, 라운드 14, peach 체크 아이콘) + primary 버튼 "시작하기" + 14pt 안내 "이미 계정이 있어요 [로그인]"(로그인은 peach link).

**포함 범위**

- 약관 동의는 단일 체크박스 1개로 단순화(mockup과 동일). 필수/선택 구분은 텍스트로만.

**제외 범위**

- 약관 본문 모달. → 별도 슬러그.

### F3. 휴대폰 번호 입력 화면 폴리시

`phone_input_screen.dart` 를 `Tr_OnbPhone` (screens-onboarding.jsx:92) 에 맞게 재구성.

**동작 방식**

- 좌상단 뒤로가기 화살표 40×40 터치 영역.
- 26pt heading "휴대폰 번호를 입력해주세요" + 14pt 부제목.
- 큰 입력 필드(국가코드 +82 prefix 고정, 11자리 숫자 키패드).
- 하단 안내 텍스트 ("이 번호로 인증번호를 보내드려요").
- primary 버튼 "인증번호 받기" (입력 유효 시 활성).

### F4. SMS 인증번호 입력 화면 폴리시

`otp_input_screen.dart` 를 `Tr_OnbSms` (screens-onboarding.jsx:165) 에 맞게 재구성.

**동작 방식**

- 6자리 입력 셀(개별 박스 또는 합쳐진 한 줄, mockup 따름).
- 재전송 카운트다운(60초) + 만료 후 "재전송" 버튼 활성.
- 자동 입력 완료 시 다음 화면 자동 전이(현재 로직 유지).

### F5. PIN 6자리 설정 화면 폴리시

`pin_setup_screen.dart` 를 `Tr_OnbPinSet` (screens-onboarding.jsx:237) 에 맞게 재구성.

**동작 방식**

- "앱 잠금용 PIN 설정" heading.
- 6자리 dot indicator 행.
- 9칸 키패드(0~9, ⌫).
- 안내 텍스트 "쉽게 추측 가능한 번호는 피해주세요 (생년월일·연속된 숫자 등). PIN은 기기 안에서만 안전하게 저장돼요."
- 설정·확인 2단계 흐름 유지. 1단계 완료 시 자동 2단계로 전이.

### F6. 생체인식 등록 다이얼로그 (신규 화면)

`Tr_OnbBio` (screens-onboarding.jsx:331) 기반 신규 다이얼로그. 현재 코드에 없음.

**동작 방식**

- PIN 설정 완료 직후 모달.
- "Face ID로 빠르게 로그인할까요?" heading.
- "다음부터 PIN 입력 없이 한 번에 잠금을 풀 수 있어요" 부제목.
- 큰 Face ID/지문 아이콘.
- primary 버튼 "사용하기" + secondary 텍스트 버튼 "나중에".
- iOS Face ID·Android 지문 모두 지원. 기기 미지원 시 다이얼로그 미노출.

**포함 범위**

- 등록 결과(성공/실패/거부)를 SecureTokenStorage 플래그로 저장.
- 다음 로그인 시 가능하면 생체 우선 시도.

**제외 범위**

- 생체인식 실제 검증 로직 결선. → `auth-login` 기존 코드 활용.

### F7. PIN 재설정 화면 폴리시

`pin_reset_screen.dart` 를 `Tr_PinReset` (screens-onboarding.jsx:351) 에 맞게 재구성.

**동작 방식**

- "본인 확인 완료 (SMS 인증)" 상단 안내 카드 (mint 배경).
- "새 PIN 6자리를 입력해주세요" heading.
- PIN 설정과 동일한 dot indicator + 키패드.
- "이전 PIN은 더 이상 사용할 수 없어요" 경고 텍스트.

### F8. PIN 로그인 화면 폴리시 (mockup 외, 일관성)

`pin_login_screen.dart` — mockup에 직접 화면은 없으나 PIN 설정과 동일한 디자인 언어 적용. 좌상단 사용자 마지막 번호 마스킹 표시 + dot indicator + 키패드.

### F9. 휴대폰 번호 변경 화면 폴리시 (mockup 외, 일관성)

`phone_change_screen.dart` — `Tr_OnbPhone` 동일 디자인 + 30일 1회 제한 배너 추가.

## 입출력

본 슬러그는 UI 폴리시이므로 새 API 호출 없음. 기존 AuthApi 인터페이스 변경 없음.

## 제약 조건

- 백엔드 호출, Riverpod 상태, 라우터 정의는 변경 금지.
- 기존 위젯의 `Key`, 의미적 라벨(testid 역할)을 유지해 회귀 테스트 통과.
- mockup의 SVG 아이콘은 Flutter `CustomPainter` 또는 동등 패키지 아이콘으로 재현. 픽셀 단위 일치까지는 아니어도 형태·비례 일치.
- 모든 화면 라이트 모드 기준. 시스템 다크 모드에서는 라이트 팔레트 강제 적용(임시).

## 예외 케이스

- 화면 회전. 세로 고정(현재 정책 유지).
- 키보드 노출 시 레이아웃 깨짐 → `resizeToAvoidBottomInset` + 스크롤 가능 영역으로 처리.
- 작은 화면(iPhone SE 등) → mockup 393×852 기준 디자인을 비율 조정 가능 위젯으로 구성.

## 채택 근거

**핵심 이유**

- 기능은 완료됐지만 UI가 단순 폼 수준이라 첫인상이 약하다. mockup이 제안하는 따뜻한 톤은 "옷장 앱"의 정서적 가치(가벼움·일상감)와 맞다.

**보조 이유**

- 디자인 토큰을 mockup 기준으로 정리해 두면 후속 슬러그(`item-register-mobile`·`closet-browse` 등)에서 동일 토큰을 재사용해 일관성 유지가 쉽다.
- 기능 회귀 위험 0(상태/API 미변경)으로 작은 폴리시 슬러그의 검증 모범 사례가 된다.

**기각된 대안**

- **`auth-login` 슬러그에 폴리시 작업을 흡수.** 이미 verified 상태라 PR 단위가 흐려진다. UI 폴리시는 별도 슬러그로 추적해 회귀·롤백을 격리.
- **신규 디자인 시스템 패키지로 분리.** 토큰 4~6개 추가 수준이라 과한 추상화. 후속 ui 슬러그들이 누적되면 그때 패키지 분리.

## 비기능 요건

**성능**

- 화면 첫 페인트 ≤16ms 추가(60fps 유지). 기존 위젯 트리 깊이 유지.

**보안**

- 추가 위협 없음. 기존 SecureTokenStorage·AuthGuard 의존성 변경 0.

**확장성**

- 디자인 토큰은 후속 ui 슬러그에서 재사용. 본 슬러그에서 추가한 4 파스텔 색은 mockup 어디든 등장하므로 글로벌 토큰으로 두는 게 합리적.

## 용어 정의

- **mockup.** `docs/plan/design/mockup/project/src/screens-onboarding.jsx` 에 정의된 6 화면 React/JSX 프로토타입.
- **디자인 토큰.** `core/theme/app_colors.dart`·`app_typography.dart`·`app_spacing.dart` 에 정의된 의미적 상수.
- **폴리시.** 기능 변경 없이 시각·인터랙션만 다듬는 작업.
