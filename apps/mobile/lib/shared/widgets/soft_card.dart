// mockup bgSoft 카드. 라운드 14·기본 패딩 12-14.

import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class SoftCard extends StatelessWidget {
    const SoftCard({
        super.key,
        required this.child,
        this.padding = const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        this.radius = 14,
        this.color = AppColors.bgSoft,
    });

    final Widget child;
    final EdgeInsetsGeometry padding;
    final double radius;
    final Color color;

    @override
    Widget build(BuildContext context) {
        return Container(
            padding: padding,
            decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(radius),
            ),
            child: child,
        );
    }
}
