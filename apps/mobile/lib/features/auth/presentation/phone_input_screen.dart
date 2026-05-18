// 휴대폰 번호 입력 화면. SMS OTP 발송 요청 → otp_input_screen 으로 이동. mockup Tr_OnbPhone 매핑.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/formatters/phone_number_formatter.dart';
import '../../../shared/widgets/auth_back_button.dart';
import '../../../shared/widgets/auth_step_bar.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/soft_card.dart';
import '../data/auth_repository.dart';
import 'signup_flow_state.dart';

class PhoneInputScreen extends ConsumerStatefulWidget {
    const PhoneInputScreen({super.key});

    @override
    ConsumerState<PhoneInputScreen> createState() => _PhoneInputScreenState();
}

class _PhoneInputScreenState extends ConsumerState<PhoneInputScreen> {
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
        if (digits.length == 10 && digits.startsWith('10')) {
            return '+82$digits';
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
        if (!RegExp(r'^\+82\d{9,10}$').hasMatch(phone)) {
            setState(() {
                _busy = false;
                _error = '휴대폰 번호 형식을 확인해주세요.';
            });
            return;
        }
        try {
            final repo = ref.read(authRepositoryProvider);
            final result = await repo.sendOtp(phone, 'SIGNUP');
            ref.read(signupFlowStateProvider.notifier).startOtp(
                    phoneNumber: phone,
                    requestId: result.requestId,
                    devCode: result.devCode,
                );
            if (mounted) {
                context.push('/auth/otp');
            }
        } catch (e) {
            setState(() {
                _error = '인증번호 발송에 실패했어요. 잠시 후 다시 시도해주세요.';
            });
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
            body: SafeArea(
                child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                            AuthBackButton(onTap: context.canPop() ? () => context.pop() : null),
                            const AuthStepBar(active: 1),
                            const SizedBox(height: 28),
                            const Text('휴대폰 번호를\n입력해주세요',
                                style: AppTypography.heading800),
                            const SizedBox(height: 10),
                            const Text('인증번호를 보내드려요',
                                style: AppTypography.body500),
                            const SizedBox(height: 36),
                            Row(
                                children: [
                                    Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 16, vertical: 14),
                                        decoration: BoxDecoration(
                                            color: AppColors.card,
                                            borderRadius: BorderRadius.circular(16),
                                            boxShadow: AppShadows.card,
                                        ),
                                        child: const Text(
                                            '🇰🇷 +82',
                                            style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w600,
                                                color: AppColors.ink,
                                            ),
                                        ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                        child: Container(
                                            decoration: BoxDecoration(
                                                color: AppColors.card,
                                                borderRadius: BorderRadius.circular(16),
                                                boxShadow: AppShadows.card,
                                            ),
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 18, vertical: 6),
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
                                                    border: InputBorder.none,
                                                    isCollapsed: true,
                                                    contentPadding: EdgeInsets.symmetric(vertical: 14),
                                                ),
                                            ),
                                        ),
                                    ),
                                ],
                            ),
                            const SizedBox(height: 14),
                            const SoftCard(
                                child: Text(
                                    '입력하신 번호는 본인 확인 용도로만 쓰여요. 광고에 활용되지 않습니다.',
                                    style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                        color: AppColors.ink2,
                                        height: 1.55,
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
                            TextButton(
                                onPressed: () => context.go('/auth/pin-login'),
                                style: TextButton.styleFrom(
                                    foregroundColor: AppColors.peachInk,
                                ),
                                child: const Text('이미 가입했어요. PIN으로 로그인'),
                            ),
                        ],
                    ),
                ),
            ),
        );
    }
}

