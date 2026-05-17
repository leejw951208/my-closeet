// AuthController 상태 전이 테스트.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:my_closet_mobile/features/auth/auth_state.dart';

void main() {
    test('초기 상태는 signedOut이다', () {
        final container = ProviderContainer();
        addTearDown(container.dispose);
        expect(
            container.read(authControllerProvider).status,
            AuthStatus.signedOut,
        );
    });

    test('signIn 호출 후 상태는 signedIn이며 토큰을 보존한다', () {
        final container = ProviderContainer();
        addTearDown(container.dispose);
        container
            .read(authControllerProvider.notifier)
            .signIn(userId: 'u1', accessToken: 'abc');
        final state = container.read(authControllerProvider);
        expect(state.status, AuthStatus.signedIn);
        expect(state.userId, 'u1');
        expect(state.accessToken, 'abc');
    });

    test('signOut 호출 후 상태는 signedOut으로 돌아간다', () {
        final container = ProviderContainer();
        addTearDown(container.dispose);
        final notifier = container.read(authControllerProvider.notifier);
        notifier.signIn(userId: 'u1', accessToken: 'abc');
        notifier.signOut();
        expect(
            container.read(authControllerProvider).status,
            AuthStatus.signedOut,
        );
    });
}
