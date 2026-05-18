// 라이트/다크 ThemeData 조립 진입점 + 공용 그림자 토큰.

import 'package:flutter/material.dart';

import 'app_colors.dart';
import 'app_typography.dart';

class AppTheme {
    AppTheme._();

    static ThemeData get light => _build(AppColors.light);
    static ThemeData get dark => _build(AppColors.dark);

    static ThemeData _build(ColorScheme scheme) {
        return ThemeData(
            useMaterial3: true,
            colorScheme: scheme,
            textTheme: AppTypography.textTheme,
            scaffoldBackgroundColor: scheme.surface,
            appBarTheme: AppBarTheme(
                backgroundColor: scheme.surface,
                foregroundColor: scheme.onSurface,
                elevation: 0,
                centerTitle: false,
            ),
        );
    }
}

class AppShadows {
    AppShadows._();

    static const List<BoxShadow> card = [
        BoxShadow(
            color: Color(0x14000000),
            blurRadius: 16,
            offset: Offset(0, 6),
        ),
    ];

    static const List<BoxShadow> elevate = [
        BoxShadow(
            color: Color(0x1F000000),
            blurRadius: 24,
            offset: Offset(0, 10),
        ),
    ];
}
