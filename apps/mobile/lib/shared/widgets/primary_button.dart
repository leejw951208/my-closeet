// mockup peach CTA 버튼. 라운드 14·높이 56·peachInk 텍스트.

import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class PrimaryButton extends StatelessWidget {
    const PrimaryButton({
        super.key,
        required this.label,
        required this.onPressed,
        this.busy = false,
    });

    final String label;
    final VoidCallback? onPressed;
    final bool busy;

    @override
    Widget build(BuildContext context) {
        final enabled = onPressed != null && !busy;
        return SizedBox(
            height: 56,
            width: double.infinity,
            child: Material(
                color: enabled ? AppColors.peach : AppColors.peach.withValues(alpha: 0.45),
                borderRadius: BorderRadius.circular(14),
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                    onTap: enabled ? onPressed : null,
                    child: Center(
                        child: busy
                            ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.peachInk),
                                  ),
                              )
                            : Text(
                                  label,
                                  style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.peachInk,
                                      letterSpacing: -0.2,
                                  ),
                              ),
                    ),
                ),
            ),
        );
    }
}
