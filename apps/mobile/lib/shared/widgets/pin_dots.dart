// PIN 입력 진행 상태를 6개 점으로 표시. mockup PinDots 매핑.

import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class PinDots extends StatelessWidget {
    const PinDots({super.key, required this.length, this.max = 6, this.shake = false});

    final int length;
    final int max;
    final bool shake;

    @override
    Widget build(BuildContext context) {
        return Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
                for (var i = 0; i < max; i++) ...[
                    AnimatedContainer(
                        duration: const Duration(milliseconds: 140),
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: i < length ? AppColors.peachInk : Colors.transparent,
                            border: Border.all(
                                color: i < length ? AppColors.peachInk : AppColors.line,
                                width: 1.5,
                            ),
                        ),
                    ),
                    if (i != max - 1) const SizedBox(width: 16),
                ],
            ],
        );
    }
}
