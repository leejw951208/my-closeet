// SMS OTP 6자리 입력 화면. 재발송 1분 쿨다운, 5분 만료 카운트다운.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../data/auth_repository.dart';
import 'signup_flow_state.dart';

class OtpInputScreen extends ConsumerStatefulWidget {
    const OtpInputScreen({super.key, this.purpose = 'SIGNUP'});
    final String purpose;

    @override
    ConsumerState<OtpInputScreen> createState() => _OtpInputScreenState();
}

class _OtpInputScreenState extends ConsumerState<OtpInputScreen> {
    final _controller = TextEditingController();
    Timer? _ticker;
    int _expiresInSec = 300;
    int _cooldownSec = 60;
    bool _busy = false;
    String? _error;

    @override
    void initState() {
        super.initState();
        _startTicker();
        WidgetsBinding.instance.addPostFrameCallback((_) => _autofillDevCode());
    }

    void _autofillDevCode() {
        final flow = ref.read(signupFlowStateProvider);
        final dev = flow.devCode;
        if (dev != null && dev.length == 6 && _controller.text.isEmpty) {
            _controller.text = dev;
        }
    }

    void _startTicker() {
        _ticker?.cancel();
        _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
            if (!mounted) return;
            setState(() {
                if (_expiresInSec > 0) _expiresInSec--;
                if (_cooldownSec > 0) _cooldownSec--;
            });
        });
    }

    Future<void> _verify() async {
        setState(() {
            _busy = true;
            _error = null;
        });
        final flow = ref.read(signupFlowStateProvider);
        if (flow.requestId == null) {
            setState(() {
                _busy = false;
                _error = '인증 세션이 만료되었어요. 처음부터 다시 시도해주세요.';
            });
            return;
        }
        try {
            final repo = ref.read(authRepositoryProvider);
            final result = await repo.verifyOtp(
                requestId: flow.requestId!,
                code: _controller.text,
                purpose: widget.purpose,
            );
            ref.read(signupFlowStateProvider.notifier).otpVerified(
                    otpSessionToken: result.otpSessionToken,
                    isNewUser: result.isNewUser,
                );
            if (!mounted) return;
            if (widget.purpose == 'RESET') {
                context.push('/auth/pin-setup?mode=reset');
            } else if (widget.purpose == 'PHONE_CHANGE') {
                context.pop();
            } else {
                context.push('/auth/onboarding-consent');
            }
        } catch (_) {
            setState(() => _error = '인증번호가 일치하지 않거나 만료되었어요.');
        } finally {
            if (mounted) setState(() => _busy = false);
        }
    }

    Future<void> _resend() async {
        if (_cooldownSec > 0) return;
        final flow = ref.read(signupFlowStateProvider);
        if (flow.phoneNumber == null) return;
        try {
            final repo = ref.read(authRepositoryProvider);
            final result = await repo.sendOtp(flow.phoneNumber!, widget.purpose);
            ref
                .read(signupFlowStateProvider.notifier)
                .startOtp(phoneNumber: flow.phoneNumber!, requestId: result.requestId);
            setState(() {
                _expiresInSec = 300;
                _cooldownSec = 60;
                _error = null;
            });
        } catch (_) {
            setState(() => _error = '재발송에 실패했어요. 잠시 후 다시 시도해주세요.');
        }
    }

    @override
    void dispose() {
        _ticker?.cancel();
        _controller.dispose();
        super.dispose();
    }

    @override
    Widget build(BuildContext context) {
        final flow = ref.watch(signupFlowStateProvider);
        return Scaffold(
            appBar: AppBar(title: const Text('인증번호 입력')),
            body: SafeArea(
                child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                            Text(
                                '${flow.phoneNumber ?? ""} 로 보낸 6자리 인증번호를 입력해주세요.',
                                style: const TextStyle(fontSize: 16),
                            ),
                            if (flow.devCode != null)
                                Container(
                                    margin: const EdgeInsets.only(top: 12),
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                        color: Colors.amber.shade100,
                                        borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                        'DEV 모드. 인증번호가 자동 입력되었어요 (${flow.devCode}).',
                                        style: const TextStyle(fontWeight: FontWeight.w600),
                                    ),
                                ),
                            const SizedBox(height: 20),
                            TextField(
                                controller: _controller,
                                keyboardType: TextInputType.number,
                                maxLength: 6,
                                inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                ],
                                decoration: const InputDecoration(
                                    labelText: '6자리 인증번호',
                                    border: OutlineInputBorder(),
                                ),
                                onChanged: (value) {
                                    if (value.length == 6 && !_busy) _verify();
                                },
                            ),
                            Text('만료까지 ${_expiresInSec}초'),
                            if (_error != null)
                                Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Text(_error!, style: const TextStyle(color: Colors.red)),
                                ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                                onPressed: _busy ? null : _verify,
                                child: _busy
                                    ? const SizedBox(
                                        height: 18,
                                        width: 18,
                                        child: CircularProgressIndicator(strokeWidth: 2),
                                    )
                                    : const Text('확인'),
                            ),
                            const SizedBox(height: 8),
                            TextButton(
                                onPressed: _cooldownSec > 0 ? null : _resend,
                                child: Text(
                                    _cooldownSec > 0
                                        ? '${_cooldownSec}초 후 재발송 가능'
                                        : '인증번호 재발송',
                                ),
                            ),
                        ],
                    ),
                ),
            ),
        );
    }
}
