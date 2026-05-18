// ThemeMode.system이 OS brightness를 따라가는지 확인하는 위젯 테스트.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:my_closet_mobile/app/app.dart';
import 'package:my_closet_mobile/core/storage/secure_token_storage.dart';
import 'package:my_closet_mobile/features/auth/data/auth_api.dart';
import 'package:my_closet_mobile/features/auth/data/auth_prefs.dart';
import 'package:my_closet_mobile/features/auth/data/auth_repository.dart';

import '../helpers/memory_prefs.dart';

class _MemStorage implements SecureTokenStorage {
    String? _a;
    String? _r;
    @override
    Future<String?> readAccessToken() async => _a;
    @override
    Future<String?> readRefreshToken() async => _r;
    @override
    Future<void> write({required String accessToken, String? refreshToken}) async {
        _a = accessToken;
        if (refreshToken != null) _r = refreshToken;
    }
    @override
    Future<void> clear() async {
        _a = null;
        _r = null;
    }
}

class _StubRepo implements AuthRepository {
    @override
    Future<TokenPair> refresh(String refreshToken) async =>
        const TokenPair(accessToken: 'a', refreshToken: 'r');
    @override
    Future<UserMe> me([String? bearer]) async =>
        const UserMe(id: 'u1', phoneNumber: '+821011112222');
    @override
    Future<void> logout(String refreshToken) async {}
    @override
    dynamic noSuchMethod(Invocation i) => super.noSuchMethod(i);
}

void main() {
    testWidgets('다크 모드 OS에서 Theme brightness가 dark가 된다', (tester) async {
        final storage = _MemStorage();
        await storage.write(accessToken: 'a', refreshToken: 'r');
        final container = ProviderContainer(
            overrides: [
                secureTokenStorageProvider.overrideWithValue(storage),
                authRepositoryProvider.overrideWithValue(_StubRepo()),
                authPrefsProvider.overrideWithValue(MemoryPrefs()),
            ],
        );
        addTearDown(container.dispose);

        tester.platformDispatcher.platformBrightnessTestValue = Brightness.dark;
        addTearDown(tester.platformDispatcher.clearPlatformBrightnessTestValue);

        await tester.pumpWidget(
            UncontrolledProviderScope(
                container: container,
                child: const MyClosetApp(),
            ),
        );
        await tester.pumpAndSettle();

        final BuildContext context = tester.element(find.byType(Scaffold).first);
        expect(Theme.of(context).brightness, Brightness.dark);
    });
}
