// AuthController 상태 전이 테스트 (백엔드 의존성은 페이크로 대체).

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:my_closet_mobile/core/storage/secure_token_storage.dart';
import 'package:my_closet_mobile/features/auth/auth_state.dart';
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

ProviderContainer _container({SecureTokenStorage? storage, AuthRepository? repo}) {
    return ProviderContainer(
        overrides: [
            secureTokenStorageProvider.overrideWithValue(storage ?? _MemoryStorage()),
            authRepositoryProvider.overrideWithValue(repo ?? _StubRepo()),
            authPrefsProvider.overrideWithValue(MemoryPrefs()),
        ],
    );
}

void main() {
    test('초기 상태는 unknown', () {
        final c = _container();
        addTearDown(c.dispose);
        expect(c.read(authControllerProvider).status, AuthStatus.unknown);
    });

    test('restore — refresh 토큰 없으면 signedOut', () async {
        final c = _container();
        addTearDown(c.dispose);
        await c.read(authControllerProvider.notifier).restore();
        expect(c.read(authControllerProvider).status, AuthStatus.signedOut);
    });

    test('restore — refresh 토큰 있으면 authenticated', () async {
        final storage = _MemoryStorage();
        await storage.write(accessToken: 'a', refreshToken: 'r');
        final c = _container(storage: storage);
        addTearDown(c.dispose);
        await c.read(authControllerProvider.notifier).restore();
        expect(c.read(authControllerProvider).status, AuthStatus.authenticated);
        expect(c.read(authControllerProvider).userId, 'u1');
    });

    test('signOut은 signedOut으로 전이하고 토큰을 비운다', () async {
        final storage = _MemoryStorage();
        await storage.write(accessToken: 'a', refreshToken: 'r');
        final c = _container(storage: storage);
        addTearDown(c.dispose);
        await c.read(authControllerProvider.notifier).signOut();
        expect(c.read(authControllerProvider).status, AuthStatus.signedOut);
        expect(await storage.readRefreshToken(), isNull);
    });
}
