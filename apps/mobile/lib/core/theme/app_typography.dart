// 본문·제목·캡션 Typography 스케일 + mockup 헤딩 스케일.

import 'package:flutter/material.dart';

import 'app_colors.dart';

class AppTypography {
    AppTypography._();

    static const TextTheme textTheme = TextTheme(
        displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.w700),
        displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
        headlineLarge: TextStyle(fontSize: 24, fontWeight: FontWeight.w600),
        headlineMedium: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
        titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w400),
        bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w400),
        labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
        labelMedium: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
    );

    // ── mockup 헤딩 스케일 ───────────────────────────────────────────────
    static const TextStyle heading800 = TextStyle(
        fontSize: 26,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.6,
        color: AppColors.ink,
    );

    static const TextStyle headingMd800 = TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.4,
        color: AppColors.ink,
    );

    static const TextStyle body500 = TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: AppColors.ink2,
        height: 1.5,
    );

    static const TextStyle caption500 = TextStyle(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: AppColors.ink2,
        height: 1.5,
    );
}
