// 인앱 숫자 키패드. PIN 로그인/설정 화면용. mockup NumPad 매핑(3×4 그리드, 좌하단 생체·우하단 백스페이스).

import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class NumPad extends StatelessWidget {
    const NumPad({
        super.key,
        required this.onDigit,
        required this.onDelete,
        this.onBio,
    });

    final void Function(String digit) onDigit;
    final VoidCallback onDelete;
    final VoidCallback? onBio;

    @override
    Widget build(BuildContext context) {
        return ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 280),
            child: GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 3,
                mainAxisSpacing: 6,
                crossAxisSpacing: 6,
                childAspectRatio: 1,
                children: [
                    for (final n in const ['1','2','3','4','5','6','7','8','9'])
                        _NumKey(label: n, onTap: () => onDigit(n)),
                    _NumKey(
                        onTap: onBio ?? () {},
                        child: const Icon(Icons.fingerprint, size: 28, color: AppColors.ink2),
                    ),
                    _NumKey(label: '0', onTap: () => onDigit('0')),
                    _NumKey(
                        onTap: onDelete,
                        child: const Icon(Icons.backspace_outlined,
                            size: 24, color: AppColors.ink2),
                    ),
                ],
            ),
        );
    }
}

class _NumKey extends StatefulWidget {
    const _NumKey({this.label, this.child, required this.onTap});
    final String? label;
    final Widget? child;
    final VoidCallback onTap;

    @override
    State<_NumKey> createState() => _NumKeyState();
}

class _NumKeyState extends State<_NumKey> {
    bool _pressed = false;

    @override
    Widget build(BuildContext context) {
        return GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTapDown: (_) => setState(() => _pressed = true),
            onTapUp: (_) => setState(() => _pressed = false),
            onTapCancel: () => setState(() => _pressed = false),
            onTap: widget.onTap,
            child: AnimatedContainer(
                duration: const Duration(milliseconds: 100),
                decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _pressed ? AppColors.bgSoft : Colors.transparent,
                ),
                alignment: Alignment.center,
                child: widget.label != null
                    ? Text(
                        widget.label!,
                        style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w500,
                            color: AppColors.ink,
                        ),
                    )
                    : widget.child,
            ),
        );
    }
}
