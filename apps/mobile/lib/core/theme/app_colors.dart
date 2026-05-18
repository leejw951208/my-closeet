// My Closet 라이트/다크 ColorScheme + mockup 팔레트 토큰.

import 'package:flutter/material.dart';

class AppColors {
    AppColors._();

    static const Color _seed = Color(0xFF5B6CFF);

    static final ColorScheme light = ColorScheme.fromSeed(
        seedColor: _seed,
        brightness: Brightness.light,
    );

    static final ColorScheme dark = ColorScheme.fromSeed(
        seedColor: _seed,
        brightness: Brightness.dark,
    );

    // ── mockup 팔레트 (screens-onboarding.jsx 기준) ─────────────────────────
    static const Color bg = Color(0xFFFFFFFF);
    static const Color bgSoft = Color(0xFFF6F4EE);
    static const Color card = Color(0xFFFFFFFF);
    static const Color ink = Color(0xFF1A1A18);
    static const Color ink2 = Color(0xFF737067);
    static const Color ink3 = Color(0xFFB5B2A8);
    static const Color line = Color(0xFFEEEAE2);

    // primary = peach (CTA)
    static const Color peach = Color(0xFFFBCFA8);
    static const Color peachInk = Color(0xFF7A4119);

    static const Color blue = Color(0xFFCFDEEF);
    static const Color blueInk = Color(0xFF2D4F7B);

    static const Color mint = Color(0xFFD9E8DC);
    static const Color mintInk = Color(0xFF3D6E50);

    static const Color lavender = Color(0xFFE3DCEF);
    static const Color lavenderInk = Color(0xFF5C4080);

    static const Color primary = peach;
    static const Color primaryInk = peachInk;

    // DEV 모드 자동 입력 안내용 노란 카드.
    static const Color devNotice = Color(0xFFFFF4D6);
}
