// PIN 재설정 진입 화면. 등록된 번호로 OTP 발송 후 otp 입력 → pin_setup(mode=reset)로 이어진다.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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

    String _normalize(String raw) {
        final digits = raw.replaceAll(RegExp(r'\D'), '');
        if (digits.startsWith('010') && digits.length == 11) {
            return '+82${digits.substring(1)}';
        }
        return '+82$digits';
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
            appBar: AppBar(title: const Text('PIN 재설정')),
            body: SafeArea(
                child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                            const Text('가입했던 휴대폰 번호로 인증번호를 보내드릴게요.'),
                            const SizedBox(height: 20),
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
                            const SizedBox(height: 20),
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
                        ],
                    ),
                ),
            ),
        );
    }
}
