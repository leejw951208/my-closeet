// 휴대폰 번호 변경 화면. 구 번호 SMS 인증 → 새 번호 SMS 인증 → phone/change.

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
import '../auth_state.dart';
import '../data/auth_repository.dart';

class PhoneChangeScreen extends ConsumerStatefulWidget {
    const PhoneChangeScreen({super.key});

    @override
    ConsumerState<PhoneChangeScreen> createState() => _PhoneChangeScreenState();
}

class _PhoneChangeScreenState extends ConsumerState<PhoneChangeScreen> {
    String? _currentRequestId;
    String? _currentSession;
    final _currentCodeCtl = TextEditingController();
    final _newPhoneCtl = TextEditingController();
    final _newCodeCtl = TextEditingController();
    String? _newRequestId;
    bool _busy = false;
    String? _error;

    String _normalize(String raw) {
        final digits = raw.replaceAll(RegExp(r'\D'), '');
        if (digits.startsWith('010') && digits.length == 11) {
            return '+82${digits.substring(1)}';
        }
        return '+82$digits';
    }

    Future<void> _run(Future<void> Function() body) async {
        setState(() {
            _busy = true;
            _error = null;
        });
        try {
            await body();
        } catch (_) {
            setState(() => _error = '요청 실패. 잠시 후 다시 시도해주세요.');
        } finally {
            if (mounted) setState(() => _busy = false);
        }
    }

    @override
    void dispose() {
        _currentCodeCtl.dispose();
        _newPhoneCtl.dispose();
        _newCodeCtl.dispose();
        super.dispose();
    }

    @override
    Widget build(BuildContext context) {
        final repo = ref.read(authRepositoryProvider);
        final auth = ref.watch(authControllerProvider);
        return Scaffold(
            backgroundColor: AppColors.bg,
            resizeToAvoidBottomInset: true,
            body: SafeArea(
                child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                            Row(
                                children: [
                                    AuthBackButton(
                                        onTap: context.canPop() ? () => context.pop() : null,
                                    ),
                                    const Spacer(),
                                    const Text(
                                        '휴대폰 번호 변경',
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
                            const SizedBox(height: 12),
                            SoftCard(
                                color: AppColors.blue,
                                child: Row(
                                    children: [
                                        const Icon(Icons.info_outline,
                                            size: 16, color: AppColors.blueInk),
                                        const SizedBox(width: 10),
                                        Expanded(
                                            child: Text(
                                                '휴대폰 번호 변경은 30일에 1회만 가능해요',
                                                style: TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w700,
                                                    color: AppColors.blueInk,
                                                ),
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            const SizedBox(height: 20),
                            Text(
                                '현재 번호. ${auth.phoneNumber ?? "-"}',
                                style: AppTypography.body500,
                            ),
                            const SizedBox(height: 12),
                            PrimaryButton(
                                label: '1) 현재 번호로 인증번호 발송',
                                onPressed: _busy
                                    ? null
                                    : () => _run(() async {
                                          final r = await repo.sendOtp(
                                              auth.phoneNumber!, 'PHONE_CHANGE');
                                          setState(() => _currentRequestId = r.requestId);
                                      }),
                            ),
                            const SizedBox(height: 12),
                            _phoneField(
                                controller: _currentCodeCtl,
                                hint: '현재 번호 인증번호 (6자리)',
                                enabled: _currentRequestId != null,
                                keyboardType: TextInputType.number,
                                maxLength: 6,
                            ),
                            const SizedBox(height: 12),
                            PrimaryButton(
                                label: '2) 현재 번호 인증 확인',
                                onPressed: _currentRequestId == null || _busy
                                    ? null
                                    : () => _run(() async {
                                          final v = await repo.verifyOtp(
                                              requestId: _currentRequestId!,
                                              code: _currentCodeCtl.text,
                                              purpose: 'PHONE_CHANGE');
                                          setState(() => _currentSession = v.otpSessionToken);
                                      }),
                            ),
                            const Divider(height: 32, color: AppColors.line),
                            _phoneField(
                                controller: _newPhoneCtl,
                                hint: '새 번호 (010-XXXX-XXXX)',
                                prefixText: '+82  ',
                                enabled: _currentSession != null,
                                keyboardType: TextInputType.phone,
                                maxLength: 11,
                            ),
                            const SizedBox(height: 12),
                            PrimaryButton(
                                label: '3) 새 번호로 인증번호 발송',
                                onPressed: _currentSession == null || _busy
                                    ? null
                                    : () => _run(() async {
                                          final phone = _normalize(_newPhoneCtl.text.trim());
                                          final r = await repo.sendOtp(phone, 'PHONE_CHANGE');
                                          setState(() => _newRequestId = r.requestId);
                                      }),
                            ),
                            const SizedBox(height: 12),
                            _phoneField(
                                controller: _newCodeCtl,
                                hint: '새 번호 인증번호 (6자리)',
                                enabled: _newRequestId != null,
                                keyboardType: TextInputType.number,
                                maxLength: 6,
                            ),
                            const SizedBox(height: 12),
                            PrimaryButton(
                                label: '4) 번호 변경 완료',
                                onPressed: _newRequestId == null || _busy
                                    ? null
                                    : () => _run(() async {
                                          final v = await repo.verifyOtp(
                                              requestId: _newRequestId!,
                                              code: _newCodeCtl.text,
                                              purpose: 'PHONE_CHANGE');
                                          await repo.changePhone(
                                              currentOtpSessionToken: _currentSession!,
                                              newOtpSessionToken: v.otpSessionToken);
                                          await ref
                                              .read(authControllerProvider.notifier)
                                              .signOut();
                                          if (context.mounted) context.go('/auth/phone');
                                      }),
                            ),
                            if (_error != null)
                                Padding(
                                    padding: const EdgeInsets.only(top: 12),
                                    child: Text(_error!,
                                        style: const TextStyle(color: Color(0xFFB3261E))),
                                ),
                            const SizedBox(height: 24),
                        ],
                    ),
                ),
            ),
        );
    }

    Widget _phoneField({
        required TextEditingController controller,
        required String hint,
        String? prefixText,
        bool enabled = true,
        TextInputType? keyboardType,
        int? maxLength,
    }) {
        return Opacity(
            opacity: enabled ? 1 : 0.5,
            child: Container(
                decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: AppShadows.card,
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: TextField(
                    controller: controller,
                    enabled: enabled,
                    keyboardType: keyboardType,
                    // phone일 때는 공백 포함 13자라 TextField.maxLength로 막으면 11자에서 잘림. formatter가 11자리 보장.
                    maxLength: keyboardType == TextInputType.phone ? null : maxLength,
                    style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                        letterSpacing: 0.4,
                    ),
                    inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        if (keyboardType == TextInputType.phone)
                            PhoneNumberFormatter()
                        else if (maxLength != null)
                            LengthLimitingTextInputFormatter(maxLength),
                    ],
                    decoration: InputDecoration(
                        hintText: hint,
                        prefixText: prefixText,
                        border: InputBorder.none,
                        isCollapsed: true,
                        counterText: '',
                        contentPadding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                ),
            ),
        );
    }
}
