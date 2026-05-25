// 온보딩 화면 위젯 동작 회귀 테스트. 매트릭스 #3 #4 #5 #12 일부 + biometric dialog 렌더.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:my_closet_mobile/core/storage/secure_token_storage.dart';
import 'package:my_closet_mobile/core/theme/app_colors.dart';
import 'package:my_closet_mobile/features/auth/auth_state.dart';
import 'package:my_closet_mobile/features/auth/data/auth_api.dart';
import 'package:my_closet_mobile/features/auth/data/auth_prefs.dart';
import 'package:my_closet_mobile/features/auth/data/auth_repository.dart';
import 'package:my_closet_mobile/features/auth/presentation/biometric_prompt_dialog.dart';
import 'package:my_closet_mobile/features/auth/presentation/onboarding_consent_screen.dart';
import 'package:my_closet_mobile/features/auth/presentation/otp_input_screen.dart';
import 'package:my_closet_mobile/features/auth/presentation/phone_change_screen.dart';
import 'package:my_closet_mobile/features/auth/presentation/phone_input_screen.dart';
import 'package:my_closet_mobile/features/auth/presentation/pin_reset_screen.dart';
import 'package:my_closet_mobile/features/auth/presentation/pin_setup_screen.dart';
import 'package:my_closet_mobile/features/auth/presentation/signup_flow_state.dart';
import 'package:my_closet_mobile/shared/widgets/primary_button.dart';
import 'package:my_closet_mobile/shared/widgets/soft_card.dart';

import '../helpers/memory_prefs.dart';

Widget _wrap(Widget child, {List<Override> overrides = const []}) {
  final router = GoRouter(
    routes: [GoRoute(path: '/', builder: (_, __) => child)],
  );
  return ProviderScope(
    overrides: overrides,
    child: MaterialApp.router(routerConfig: router),
  );
}

class _MemoryStorage implements SecureTokenStorage {
  String? _access;
  String? _refresh;
  @override
  Future<String?> readAccessToken() async => _access;
  @override
  Future<String?> readRefreshToken() async => _refresh;
  @override
  Future<void> write(
      {required String accessToken, String? refreshToken}) async {
    _access = accessToken;
    if (refreshToken != null) _refresh = refreshToken;
  }

  @override
  Future<void> clear() async {
    _access = null;
    _refresh = null;
  }
}

class _AuthScreenRepo implements AuthRepository {
  _AuthScreenRepo({this.isNewUser = false});

  final bool isNewUser;
  int sendOtpCount = 0;
  int verifyOtpCount = 0;

  @override
  Future<OtpRequestResult> sendOtp(String phoneNumber, String purpose) async {
    sendOtpCount++;
    return OtpRequestResult(
      requestId: 'request-$sendOtpCount',
      expiresInSec: 300,
    );
  }

  @override
  Future<OtpVerifyResult> verifyOtp({
    required String requestId,
    required String code,
    required String purpose,
  }) async {
    verifyOtpCount++;
    return OtpVerifyResult(
      otpSessionToken: 'session-$verifyOtpCount',
      isNewUser: isNewUser,
    );
  }

  @override
  Future<TokenPair> refresh(String refreshToken) async =>
      const TokenPair(accessToken: 'new-a', refreshToken: 'new-r');
  @override
  Future<UserMe> me([String? bearer]) async =>
      const UserMe(id: 'u1', phoneNumber: '+821011112222');
  @override
  Future<UserMe> changePhone({
    required String currentOtpSessionToken,
    required String newOtpSessionToken,
  }) async =>
      const UserMe(id: 'u1', phoneNumber: '+821099998888');
  @override
  Future<void> logout(String refreshToken) async {}
  @override
  dynamic noSuchMethod(Invocation i) => super.noSuchMethod(i);
}

Future<void> _phoneSize(WidgetTester tester) async {
  await tester.binding.setSurfaceSize(const Size(393, 852));
  addTearDown(() => tester.binding.setSurfaceSize(null));
}

void main() {
  testWidgets('매트릭스 #3+#4: 동의 화면 렌더 + 미체크 시 CTA 비활성', (tester) async {
    await _phoneSize(tester);
    await tester.pumpWidget(_wrap(const OnboardingConsentScreen()));
    await tester.pumpAndSettle();

    expect(find.text('내 옷장을 휴대폰 속으로'), findsOneWidget);
    expect(find.text('시작하기'), findsOneWidget);

    final btn = tester.widget<PrimaryButton>(find.byType(PrimaryButton));
    expect(btn.onPressed, isNull);
  });

  testWidgets('동의 체크 후 CTA 활성', (tester) async {
    await _phoneSize(tester);
    final container = ProviderContainer();
    addTearDown(container.dispose);
    container.read(signupFlowStateProvider.notifier).setConsent(true);

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: MaterialApp.router(
          routerConfig: GoRouter(routes: [
            GoRoute(
                path: '/', builder: (_, __) => const OnboardingConsentScreen()),
          ]),
        ),
      ),
    );
    await tester.pumpAndSettle();

    final btn = tester.widget<PrimaryButton>(find.byType(PrimaryButton));
    expect(btn.onPressed, isNotNull);
  });

  testWidgets('매트릭스 #5: 전화번호 11자리 미만이면 CTA 비활성', (tester) async {
    await _phoneSize(tester);
    await tester.pumpWidget(_wrap(const PhoneInputScreen()));
    await tester.pumpAndSettle();

    // 처음에는 입력이 없으니 비활성.
    var btn = tester.widget<PrimaryButton>(find.byType(PrimaryButton));
    expect(btn.onPressed, isNull);

    await tester.enterText(find.byType(TextField), '01012345');
    await tester.pump();
    btn = tester.widget<PrimaryButton>(find.byType(PrimaryButton));
    expect(btn.onPressed, isNull, reason: '8자리 → 비활성');

    await tester.enterText(find.byType(TextField), '01012345678');
    await tester.pump();
    btn = tester.widget<PrimaryButton>(find.byType(PrimaryButton));
    expect(btn.onPressed, isNotNull, reason: '11자리 → 활성');
  });

  testWidgets('매트릭스 #12: PIN 재설정 화면에 mint 안내 카드가 보인다', (tester) async {
    await _phoneSize(tester);
    await tester.pumpWidget(_wrap(const PinResetScreen()));
    await tester.pumpAndSettle();

    expect(find.text('PIN 재설정'), findsOneWidget);
    expect(find.textContaining('본인 확인'), findsOneWidget);

    final softCards = tester.widgetList<SoftCard>(find.byType(SoftCard));
    final hasMint = softCards.any((c) => c.color == AppColors.mint);
    expect(hasMint, isTrue);
  });

  testWidgets('biometric dialog: "나중에" 탭 시 false 반환', (tester) async {
    Future<bool?>? result;
    await tester.pumpWidget(MaterialApp(
      home: Builder(builder: (ctx) {
        return Scaffold(
          body: Center(
            child: ElevatedButton(
              onPressed: () {
                result = showDialog<bool>(
                  context: ctx,
                  builder: (dialogCtx) => Dialog(
                    backgroundColor: Colors.transparent,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        PrimaryButton(
                          label: '생체인식 등록',
                          onPressed: () => Navigator.of(dialogCtx).pop(true),
                        ),
                        TextButton(
                          onPressed: () => Navigator.of(dialogCtx).pop(false),
                          child: const Text('나중에 설정에서'),
                        ),
                      ],
                    ),
                  ),
                );
              },
              child: const Text('open'),
            ),
          ),
        );
      }),
    ));

    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('나중에 설정에서'));
    await tester.pumpAndSettle();
    expect(await result, false);
  });

  testWidgets('매트릭스 #7: PIN 1차 6자리 → 2차로 자동 전이', (tester) async {
    await _phoneSize(tester);
    await tester.pumpWidget(_wrap(const PinSetupScreen()));
    await tester.pumpAndSettle();

    // 초기에는 1차 입력이 active. "PIN 6자리를 입력해주세요" 안내가 보인다.
    expect(find.text('PIN 6자리를 입력해주세요'), findsOneWidget);

    // stage별 hidden input은 항상 1개만 렌더된다.
    expect(find.byType(TextField), findsOneWidget);
    await tester.enterText(find.byType(TextField), '135790');
    await tester.pumpAndSettle();

    // 2차 단계로 전이 → 안내 텍스트 교체.
    expect(find.text('한 번 더 입력해 확인해주세요'), findsOneWidget);
    expect(find.text('PIN 6자리를 입력해주세요'), findsNothing);
  });

  testWidgets('매트릭스 #8: 두 PIN 불일치 → 1차 복귀 + 에러 노출', (tester) async {
    await _phoneSize(tester);
    await tester.pumpWidget(_wrap(const PinSetupScreen()));
    await tester.pumpAndSettle();

    // 1차 입력.
    await tester.enterText(find.byType(TextField), '135790');
    await tester.pumpAndSettle();
    // 2차 단계로 전이됐고 단일 TextField는 confirm controller에 연결.
    await tester.enterText(find.byType(TextField), '246801');
    await tester.pumpAndSettle();

    // 둘 다 6자리이므로 "가입 완료" 버튼 활성화.
    final cta = find.widgetWithText(PrimaryButton, '가입 완료');
    expect(cta, findsOneWidget);
    await tester.tap(cta);
    await tester.pump();

    // 불일치 처리 결과: 1차 단계로 복귀, 에러 메시지 노출.
    expect(find.text('PIN 6자리를 입력해주세요'), findsOneWidget);
    expect(find.text('두 번 입력한 PIN이 달라요.'), findsOneWidget);
  });

  testWidgets('OTP 화면의 번호 변경 텍스트는 이전 번호 입력 화면으로 돌아간다', (tester) async {
    await _phoneSize(tester);
    final container = ProviderContainer();
    addTearDown(container.dispose);
    container.read(signupFlowStateProvider.notifier).startOtp(
          phoneNumber: '+821012345678',
          requestId: 'r1',
        );
    final router = GoRouter(
      initialLocation: '/auth/otp',
      routes: [
        GoRoute(
            path: '/auth/phone', builder: (_, __) => const PhoneInputScreen()),
        GoRoute(path: '/auth/otp', builder: (_, __) => const OtpInputScreen()),
      ],
    );

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: MaterialApp.router(routerConfig: router),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('번호 변경'));
    await tester.pumpAndSettle();

    expect(router.routerDelegate.currentConfiguration.uri.toString(),
        '/auth/phone');
    expect(find.text('휴대폰 번호를\n입력해주세요'), findsOneWidget);
  });

  testWidgets('SIGNUP OTP가 기존 사용자이면 PIN 로그인으로 이동한다', (tester) async {
    await _phoneSize(tester);
    final storage = _MemoryStorage();
    final prefs = MemoryPrefs();
    final repo = _AuthScreenRepo(isNewUser: false);
    final container = ProviderContainer(
      overrides: [
        secureTokenStorageProvider.overrideWithValue(storage),
        authPrefsProvider.overrideWithValue(prefs),
        authRepositoryProvider.overrideWithValue(repo),
      ],
    );
    addTearDown(container.dispose);
    container.read(signupFlowStateProvider.notifier).startOtp(
          phoneNumber: '+821051298813',
          requestId: 'r-existing',
        );
    final router = GoRouter(
      initialLocation: '/auth/otp',
      routes: [
        GoRoute(path: '/auth/otp', builder: (_, __) => const OtpInputScreen()),
        GoRoute(
          path: '/auth/pin-login',
          builder: (_, __) => const Scaffold(body: Text('PIN 로그인')),
        ),
        GoRoute(
            path: '/auth/pin-setup',
            builder: (_, __) => const PinSetupScreen()),
      ],
    );

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: MaterialApp.router(routerConfig: router),
      ),
    );
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField), '123456');
    await tester.pumpAndSettle();

    expect(router.routerDelegate.currentConfiguration.uri.toString(),
        '/auth/pin-login');
    expect(find.text('PIN 로그인'), findsOneWidget);
    expect(container.read(authControllerProvider).lastKnownPhoneNumber,
        '+821051298813');
    expect(await prefs.readLastPhoneNumber(), '+821051298813');
  });

  testWidgets('휴대폰 번호 변경은 단계별 입력이 유효할 때만 다음 버튼이 활성화된다', (tester) async {
    await _phoneSize(tester);
    final storage = _MemoryStorage();
    final repo = _AuthScreenRepo();
    final container = ProviderContainer(
      overrides: [
        secureTokenStorageProvider.overrideWithValue(storage),
        authPrefsProvider.overrideWithValue(MemoryPrefs()),
        authRepositoryProvider.overrideWithValue(repo),
      ],
    );
    addTearDown(container.dispose);
    await container.read(authControllerProvider.notifier).setSession(
          userId: 'u1',
          phoneNumber: '+821011112222',
          tokens: const TokenPair(accessToken: 'a', refreshToken: 'r'),
        );
    final router = GoRouter(
      routes: [
        GoRoute(path: '/', builder: (_, __) => const PhoneChangeScreen()),
        GoRoute(
            path: '/auth/phone', builder: (_, __) => const PhoneInputScreen()),
      ],
    );

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: MaterialApp.router(routerConfig: router),
      ),
    );
    await tester.pumpAndSettle();

    PrimaryButton button(String label) =>
        tester.widget<PrimaryButton>(find.widgetWithText(PrimaryButton, label));

    expect(button('2) 현재 번호 인증 확인').onPressed, isNull);
    expect(button('3) 새 번호로 인증번호 발송').onPressed, isNull);
    expect(button('4) 번호 변경 완료').onPressed, isNull);

    await tester.tap(find.widgetWithText(PrimaryButton, '1) 현재 번호로 인증번호 발송'));
    await tester.pumpAndSettle();
    expect(button('2) 현재 번호 인증 확인').onPressed, isNull);

    await tester.enterText(find.byType(TextField).at(0), '123456');
    await tester.pump();
    expect(button('2) 현재 번호 인증 확인').onPressed, isNotNull);

    await tester.tap(find.widgetWithText(PrimaryButton, '2) 현재 번호 인증 확인'));
    await tester.pumpAndSettle();
    expect(button('3) 새 번호로 인증번호 발송').onPressed, isNull);

    await tester.enterText(find.byType(TextField).at(1), '01099998888');
    await tester.pump();
    expect(button('3) 새 번호로 인증번호 발송').onPressed, isNotNull);

    await tester.tap(find.widgetWithText(PrimaryButton, '3) 새 번호로 인증번호 발송'));
    await tester.pumpAndSettle();
    expect(button('4) 번호 변경 완료').onPressed, isNull);

    await tester.enterText(find.byType(TextField).at(2), '654321');
    await tester.pump();
    expect(button('4) 번호 변경 완료').onPressed, isNotNull);
  });

  testWidgets('showBiometricPromptDialog: 기기 미지원이면 null 반환(미노출)',
      (tester) async {
    // 테스트 환경의 LocalAuthentication 채널이 미응답 → 예외 → null 반환 경로.
    await tester.pumpWidget(MaterialApp(
      home: Builder(builder: (ctx) {
        return Scaffold(
          body: ElevatedButton(
            onPressed: () async {
              final r = await showBiometricPromptDialog(ctx);
              expect(r, isNull);
            },
            child: const Text('go'),
          ),
        );
      }),
    ));
    await tester.tap(find.text('go'));
    await tester.pumpAndSettle();
    // 다이얼로그가 뜨지 않아야 한다.
    expect(find.text('생체인식 등록'), findsNothing);
  });
}
