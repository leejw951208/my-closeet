// 상단 진행 단계 표시 바. 4단계 중 active만큼 peachInk로 채운다.

import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class AuthStepBar extends StatelessWidget {
    const AuthStepBar({super.key, required this.active, this.total = 4});
    final int active;
    final int total;

    @override
    Widget build(BuildContext context) {
        return Row(
            children: List.generate(total, (i) {
                final on = i < active;
                return Expanded(
                    child: Container(
                        margin: EdgeInsets.only(right: i == total - 1 ? 0 : 4),
                        height: 3,
                        decoration: BoxDecoration(
                            color: on ? AppColors.peachInk : AppColors.line,
                            borderRadius: BorderRadius.circular(2),
                        ),
                    ),
                );
            }),
        );
    }
}
