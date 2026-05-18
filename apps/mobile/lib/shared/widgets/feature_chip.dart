// 36px 컬러 칩. peach/mint/blue/lavender 4 variant.

import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

enum FeatureChipVariant { peach, mint, blue, lavender }

class FeatureChip extends StatelessWidget {
    const FeatureChip({
        super.key,
        required this.variant,
        this.size = 36,
        this.icon,
    });

    final FeatureChipVariant variant;
    final double size;
    final IconData? icon;

    Color get _bg {
        switch (variant) {
            case FeatureChipVariant.peach:
                return AppColors.peach;
            case FeatureChipVariant.mint:
                return AppColors.mint;
            case FeatureChipVariant.blue:
                return AppColors.blue;
            case FeatureChipVariant.lavender:
                return AppColors.lavender;
        }
    }

    Color get _ink {
        switch (variant) {
            case FeatureChipVariant.peach:
                return AppColors.peachInk;
            case FeatureChipVariant.mint:
                return AppColors.mintInk;
            case FeatureChipVariant.blue:
                return AppColors.blueInk;
            case FeatureChipVariant.lavender:
                return AppColors.lavenderInk;
        }
    }

    @override
    Widget build(BuildContext context) {
        return Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
                color: _bg,
                borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: Icon(icon ?? Icons.circle, color: _ink, size: size * 0.5),
        );
    }
}
