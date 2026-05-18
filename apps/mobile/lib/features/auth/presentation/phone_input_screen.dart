// 휴대폰 번호 입력 화면. SMS OTP 발송 요청 → otp_input_screen 으로 이동.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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
            appBar: AppBar(title: const Text('휴대폰 번호로 시작')),
            body: SafeArea(
                child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                            const Text(
                                '인증번호를 받을 휴대폰 번호를 입력해주세요.',
                                style: TextStyle(fontSize: 16),
                            ),
                            const SizedBox(height: 24),
                            TextField(
                                controller: _controller,
                                keyboardType: TextInputType.phone,
                                inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                    LengthLimitingTextInputFormatter(11),
                                ],
                                decoration: const InputDecoration(
                                    labelText: '010-XXXX-XXXX',
                                    prefixText: '+82 ',
                                    border: OutlineInputBorder(),
                                ),
                            ),
                            if (_error != null) ...[
                                const SizedBox(height: 12),
                                Text(_error!, style: const TextStyle(color: Colors.red)),
                            ],
                            const SizedBox(height: 24),
                            ElevatedButton(
                                onPressed: _busy ? null : _submit,
                                child: _busy
                                    ? const SizedBox(
                                        height: 18,
                                        width: 18,
                                        child: CircularProgressIndicator(strokeWidth: 2),
                                    )
                                    : const Text('인증번호 받기'),
                            ),
                            const SizedBox(height: 16),
                            TextButton(
                                onPressed: () => context.push('/auth/pin-login'),
                                child: const Text('이미 가입했어요. PIN으로 로그인'),
                            ),
                        ],
                    ),
                ),
            ),
        );
    }
}
