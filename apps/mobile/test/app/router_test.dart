// go_router redirect 동작 테스트.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:my_closet_mobile/app/router.dart';
import 'package:my_closet_mobile/core/storage/secure_token_storage.dart';
import 'package:my_closet_mobile/features/auth/data/auth_api.dart';
import 'package:my_closet_mobile/features/auth/data/auth_prefs.dart';
import 'package:my_closet_mobile/features/auth/data/auth_repository.dart';

import '../helpers/memory_prefs.dart';

class _MemoryStorage implements SecureTokenStorage {
    String? _access;
    String? _refresh;
    @override
    Future<String?> readAccessToken() async => _access;
    @override
    Future<String?> readRefreshToken() async => _refresh;
    @override
    Future<void> write({required String accessToken, String? refreshToken}) async {
        _access = accessToken;
        if (refreshToken != null) _refresh = refreshToken;
    }
    @override
    Future<void> clear() async {
        _access = null;
        _refresh = null;
    }
}

class _StubRepo implements AuthRepository {
    @override
    Future<TokenPair> refresh(String refreshToken) async =>
        const TokenPair(accessToken: 'new-a', refreshToken: 'new-r');
    @override
    Future<UserMe> me([String? bearer]) async =>
        const UserMe(id: 'u1', phoneNumber: '+821011112222');
    @override
    Future<void> logout(String refreshToken) async {}
    @override
    dynamic noSuchMethod(Invocation i) => super.noSuchMethod(i);
}

ProviderContainer _container({SecureTokenStorage? storage, AuthPrefs? prefs}) {
    return ProviderContainer(
        overrides: [
            secureTokenStorageProvider.overrideWithValue(storage ?? _MemoryStorage()),
            authRepositoryProvider.overrideWithValue(_StubRepo()),
            authPrefsProvider.overrideWithValue(prefs ?? MemoryPrefs()),
        ],
    );
}

Future<GoRouter> _pumpApp(WidgetTester tester, ProviderContainer container) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    final router = container.read(routerProvider);
    await tester.pumpWidget(
        UncontrolledProviderScope(
            container: container,
            child: MaterialApp.router(routerConfig: router),
        ),
    );
    await tester.pumpAndSettle();
    return router;
}

void main() {
    testWidgets('비로그인 상태에서 보호 라우트는 /auth/onboarding-consent로 리다이렉트', (tester) async {
        final c = _container();
        addTearDown(c.dispose);
        // 부팅 후 restore가 자동으로 signedOut으로 보낸다.
        final router = await _pumpApp(tester, c);
        router.go(AppRoute.closet.path);
        await tester.pumpAndSettle();
        expect(
            router.routerDelegate.currentConfiguration.uri.toString(),
            AppRoute.onboardingConsent.path,
        );
    });

    testWidgets('인증 상태에서 /auth/pin-login 진입 시 홈으로 리다이렉트', (tester) async {
        final storage = _MemoryStorage();
        await storage.write(accessToken: 'a', refreshToken: 'r');
        final c = _container(storage: storage);
        addTearDown(c.dispose);
        final router = await _pumpApp(tester, c);
        router.go(AppRoute.pinLogin.path);
        await tester.pumpAndSettle();
        expect(
            router.routerDelegate.currentConfiguration.uri.toString(),
            AppRoute.home.path,
        );
    });

    testWidgets('인증 후 홈은 완료 메시지와 다음 행동 CTA를 보여준다', (tester) async {
        final storage = _MemoryStorage();
        await storage.write(accessToken: 'a', refreshToken: 'r');
        final c = _container(storage: storage);
        addTearDown(c.dispose);

        await _pumpApp(tester, c);

        expect(find.text('로그인이 완료됐어요'), findsOneWidget);
        expect(find.text('옷장 확인하기'), findsOneWidget);
        expect(find.text('휴대폰 번호 변경'), findsWidgets);
    });
}
