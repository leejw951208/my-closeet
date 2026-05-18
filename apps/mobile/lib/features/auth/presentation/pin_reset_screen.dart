// PIN 재설정 진입 화면. 등록된 번호로 OTP 발송 후 otp 입력 → pin_setup(mode=reset)로 이어진다. mockup Tr_PinReset 일부 매핑.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/formatters/phone_number_formatter.dart';
import '../../../shared/widgets/auth_back_button.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/soft_card.dart';
import '../data/auth_repository.dart';
import 'signup_flow_state.dart';

class PinResetScreen extends ConsumerStatefulWidget {
    const PinResetScreen({super.key});

    @override
    ConsumerState<PinResetScreen> createState() => _PinResetScreenState();
}

class _PinResetScreenState extends ConsumerState<PinResetScreen> {
    final _controller = TextEditingController();
    bool _busy = false;
    String? _error;

    @override
    void initState() {
        super.initState();
        _controller.addListener(() => setState(() {}));
    }

    String _normalize(String raw) {
        final digits = raw.replaceAll(RegExp(r'\D'), '');
        if (digits.startsWith('010') && digits.length == 11) {
            return '+82${digits.substring(1)}';
        }
        return '+82$digits';
    }

    bool get _valid {
        final digits = _controller.text.replaceAll(RegExp(r'\D'), '');
        return digits.length == 11 && digits.startsWith('010');
    }

    Future<void> _submit() async {
        setState(() {
            _busy = true;
            _error = null;
        });
        final phone = _normalize(_controller.text.trim());
        try {
            final repo = ref.read(authRepositoryProvider);
            final result = await repo.sendOtp(phone, 'RESET');
            ref.read(signupFlowStateProvider.notifier).startOtp(
                    phoneNumber: phone,
                    requestId: result.requestId,
                    devCode: result.devCode,
                );
            if (mounted) {
                context.push('/auth/otp?purpose=RESET');
            }
        } catch (_) {
            setState(() => _error = '등록되지 않은 번호이거나 발송에 실패했어요.');
        } finally {
            if (mounted) setState(() => _busy = false);
        }
    }

    @override
    void dispose() {
        _controller.dispose();
        super.dispose();
    }

    @override
    Widget build(BuildContext context) {
        return Scaffold(
            backgroundColor: AppColors.bg,
            resizeToAvoidBottomInset: true,
            body: SafeArea(
                child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                            Row(
                                children: [
                                    AuthBackButton(
                                        onTap: context.canPop() ? () => context.pop() : null,
                                        icon: Icons.close,
                                    ),
                                    const Spacer(),
                                    const Text(
                                        'PIN 재설정',
                                        style: TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.ink,
                                        ),
                                    ),
                                    const Spacer(),
                                    const SizedBox(width: 40),
                                ],
                            ),
                            const SizedBox(height: 18),
                            SoftCard(
                                color: AppColors.mint,
                                child: Row(
                                    children: [
                                        const Icon(Icons.check_circle_outline,
                                            color: AppColors.mintInk, size: 16),
                                        const SizedBox(width: 10),
                                        Expanded(
                                            child: Text(
                                                '본인 확인을 위해 등록된 번호로 인증번호를 보내드릴게요',
                                                style: TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w700,
                                                    color: AppColors.mintInk,
                                                ),
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            const SizedBox(height: 26),
                            const Text(
                                '가입했던 휴대폰 번호',
                                style: AppTypography.headingMd800,
                            ),
                            const SizedBox(height: 8),
                            const Text(
                                '이전 PIN은 더 이상 사용할 수 없어요',
                                style: AppTypography.body500,
                            ),
                            const SizedBox(height: 24),
                            Container(
                                decoration: BoxDecoration(
                                    color: AppColors.card,
                                    borderRadius: BorderRadius.circular(16),
                                    boxShadow: AppShadows.card,
                                ),
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 6),
                                child: TextField(
                                    controller: _controller,
                                    autofocus: true,
                                    keyboardType: TextInputType.phone,
                                    style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.ink,
                                        letterSpacing: 0.6,
                                    ),
                                    inputFormatters: [
                                        FilteringTextInputFormatter.digitsOnly,
                                        PhoneNumberFormatter(),
                                    ],
                                    decoration: const InputDecoration(
                                        hintText: '010 1234 5678',
                                        prefixText: '+82  ',
                                        border: InputBorder.none,
                                        isCollapsed: true,
                                        contentPadding: EdgeInsets.symmetric(vertical: 14),
                                    ),
                                ),
                            ),
                            if (_error != null) ...[
                                const SizedBox(height: 12),
                                Text(_error!,
                                    style: const TextStyle(color: Color(0xFFB3261E))),
                            ],
                            const Spacer(),
                            PrimaryButton(
                                label: '인증번호 받기',
                                busy: _busy,
                                onPressed: (_valid && !_busy) ? _submit : null,
                            ),
                            const SizedBox(height: 12),
                        ],
                    ),
                ),
            ),
        );
    }
}
