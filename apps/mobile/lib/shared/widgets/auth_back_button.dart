// 40×40 좌상단 뒤로가기 아이콘. onTap이 null이면 비활성.

import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class AuthBackButton extends StatelessWidget {
    const AuthBackButton({super.key, required this.onTap, this.icon = Icons.arrow_back});
    final VoidCallback? onTap;
    final IconData icon;

    @override
    Widget build(BuildContext context) {
        return Align(
            alignment: Alignment.centerLeft,
            child: GestureDetector(
                onTap: onTap,
                behavior: HitTestBehavior.opaque,
                child: SizedBox(
                    width: 40,
                    height: 40,
                    child: Icon(icon, color: AppColors.ink, size: 22),
                ),
            ),
        );
    }
}
