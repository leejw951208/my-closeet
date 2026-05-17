// 환경 변수 누락 시 사용자에게 명시적 에러를 보여주는 폴백 앱.

import 'package:flutter/material.dart';

import '../core/theme/app_spacing.dart';

class EnvErrorApp extends StatelessWidget {
    const EnvErrorApp({super.key, required this.missing});

    final List<String> missing;

    @override
    Widget build(BuildContext context) {
        return MaterialApp(
            title: 'My Closet',
            home: Scaffold(
                body: SafeArea(
                    child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                                const Text(
                                    '환경 설정 누락',
                                    style: TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.bold,
                                    ),
                                ),
                                const SizedBox(height: AppSpacing.md),
                                const Text(
                                    '다음 환경 변수가 누락되어 앱을 시작할 수 없습니다.',
                                ),
                                const SizedBox(height: AppSpacing.md),
                                for (final key in missing)
                                    Padding(
                                        padding: const EdgeInsets.symmetric(
                                            vertical: AppSpacing.xs / 2,
                                        ),
                                        child: Text(
                                            '· $key',
                                            style: const TextStyle(
                                                fontFamily: 'monospace',
                                            ),
                                        ),
                                    ),
                                const SizedBox(height: AppSpacing.md),
                                const Text(
                                    'flutter run --dart-define=API_BASE_URL=... 등의 옵션으로 다시 실행하세요.',
                                ),
                            ],
                        ),
                    ),
                ),
            ),
        );
    }
}
