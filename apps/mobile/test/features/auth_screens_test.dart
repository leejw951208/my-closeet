// 온보딩 화면 위젯 동작 회귀 테스트. 매트릭스 #3 #4 #5 #12 일부 + biometric dialog 렌더.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:my_closet_mobile/core/theme/app_colors.dart';
import 'package:my_closet_mobile/features/auth/presentation/biometric_prompt_dialog.dart';
import 'package:my_closet_mobile/features/auth/presentation/onboarding_consent_screen.dart';
import 'package:my_closet_mobile/features/auth/presentation/phone_input_screen.dart';
import 'package:my_closet_mobile/features/auth/presentation/pin_reset_screen.dart';
import 'package:my_closet_mobile/features/auth/presentation/pin_setup_screen.dart';
import 'package:my_closet_mobile/features/auth/presentation/signup_flow_state.dart';
import 'package:my_closet_mobile/shared/widgets/primary_button.dart';
import 'package:my_closet_mobile/shared/widgets/soft_card.dart';

Widget _wrap(Widget child, {List<Override> overrides = const []}) {
    final router = GoRouter(
        routes: [GoRoute(path: '/', builder: (_, __) => child)],
    );
    return ProviderScope(
        overrides: overrides,
        child: MaterialApp.router(routerConfig: router),
    );
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
                        GoRoute(path: '/', builder: (_, __) => const OnboardingConsentScreen()),
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

        final fields = find.byType(TextField);
        expect(fields, findsNWidgets(2));

        await tester.enterText(fields.first, '135790');
        await tester.pump();

        // 2차 단계로 전이 → 안내 텍스트 교체.
        expect(find.text('한 번 더 입력해 확인해주세요'), findsOneWidget);
        expect(find.text('PIN 6자리를 입력해주세요'), findsNothing);
    });

    testWidgets('매트릭스 #8: 두 PIN 불일치 → 1차 복귀 + 에러 노출', (tester) async {
        await _phoneSize(tester);
        await tester.pumpWidget(_wrap(const PinSetupScreen()));
        await tester.pumpAndSettle();

        final fields = find.byType(TextField);
        await tester.enterText(fields.first, '135790');
        await tester.pump();
        await tester.enterText(fields.at(1), '246801');
        await tester.pump();

        // 둘 다 6자리이므로 "가입 완료" 버튼 활성화.
        final cta = find.widgetWithText(PrimaryButton, '가입 완료');
        expect(cta, findsOneWidget);
        await tester.tap(cta);
        await tester.pump();

        // 불일치 처리 결과: 1차 단계로 복귀, 에러 메시지 노출.
        expect(find.text('PIN 6자리를 입력해주세요'), findsOneWidget);
        expect(find.text('두 번 입력한 PIN이 달라요.'), findsOneWidget);
    });

    testWidgets('showBiometricPromptDialog: 기기 미지원이면 null 반환(미노출)', (tester) async {
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
