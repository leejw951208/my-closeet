// My Closet 라이트/다크 ColorScheme 토큰.

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
}
