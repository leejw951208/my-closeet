// 앱 루트 위젯. 라우터/테마를 결선한다.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/theme/app_theme.dart';
import 'router.dart';

class MyClosetApp extends ConsumerWidget {
    const MyClosetApp({super.key});

    @override
    Widget build(BuildContext context, WidgetRef ref) {
        final router = ref.watch(routerProvider);
        return MaterialApp.router(
            title: 'My Closet',
            theme: AppTheme.light,
            darkTheme: AppTheme.dark,
            themeMode: ThemeMode.system,
            routerConfig: router,
        );
    }
}
