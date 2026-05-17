// ThemeMode.system이 OS brightness를 따라가는지 확인하는 위젯 테스트.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:my_closet_mobile/app/app.dart';
import 'package:my_closet_mobile/features/auth/auth_state.dart';

void main() {
    testWidgets('다크 모드 OS에서 Theme brightness가 dark가 된다', (tester) async {
        final container = ProviderContainer();
        addTearDown(container.dispose);
        container
            .read(authControllerProvider.notifier)
            .signIn(userId: 'u1', accessToken: 't');

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
