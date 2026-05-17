// go_router redirect 동작 테스트.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:my_closet_mobile/app/router.dart';
import 'package:my_closet_mobile/features/auth/auth_state.dart';

Future<GoRouter> _pumpApp(WidgetTester tester, ProviderContainer container) async {
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
    testWidgets('비로그인 상태에서 보호 라우트로 이동하면 /login으로 리다이렉트된다', (tester) async {
        final container = ProviderContainer();
        addTearDown(container.dispose);
        final router = await _pumpApp(tester, container);
        router.go(AppRoute.closet.path);
        await tester.pumpAndSettle();
        expect(
            router.routerDelegate.currentConfiguration.uri.toString(),
            AppRoute.login.path,
        );
    });

    testWidgets('로그인 상태에서 /login 진입 시 홈으로 리다이렉트된다', (tester) async {
        final container = ProviderContainer();
        addTearDown(container.dispose);
        container
            .read(authControllerProvider.notifier)
            .signIn(userId: 'u1', accessToken: 't');
        final router = await _pumpApp(tester, container);
        router.go(AppRoute.login.path);
        await tester.pumpAndSettle();
        expect(
            router.routerDelegate.currentConfiguration.uri.toString(),
            AppRoute.home.path,
        );
    });
}
