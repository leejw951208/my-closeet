// PIN 6자리 등록 화면. 가입 완료(/auth/signup/complete) 또는 재설정(/auth/pin/reset)을 호출한다.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:local_auth/local_auth.dart';

import '../auth_state.dart';
import '../data/auth_prefs.dart';
import '../data/auth_repository.dart';
import '../data/device_id_provider.dart';
import 'signup_flow_state.dart';

class PinSetupScreen extends ConsumerStatefulWidget {
    const PinSetupScreen({super.key, this.mode = 'signup'});
    final String mode;

    @override
    ConsumerState<PinSetupScreen> createState() => _PinSetupScreenState();
}

class _PinSetupScreenState extends ConsumerState<PinSetupScreen> {
    final _pinController = TextEditingController();
    final _confirmController = TextEditingController();
    bool _busy = false;
    String? _error;

    Future<void> _submit() async {
        if (_pinController.text != _confirmController.text) {
            setState(() => _error = '두 번 입력한 PIN이 달라요.');
            return;
        }
        setState(() {
            _busy = true;
            _error = null;
        });
        final flow = ref.read(signupFlowStateProvider);
        final session = flow.otpSessionToken;
        if (session == null) {
            setState(() {
                _busy = false;
                _error = '인증 세션이 만료되었어요. 처음부터 다시 시도해주세요.';
            });
            return;
        }
        try {
            final repo = ref.read(authRepositoryProvider);
            final deviceId = await ref.read(deviceIdStoreProvider).getOrCreate();
            if (widget.mode == 'reset') {
                final tokens = await repo.pinReset(
                    otpSessionToken: session,
                    newPin: _pinController.text,
                    deviceId: deviceId,
                );
                final me = await repo.me(tokens.accessToken);
                await ref.read(authControllerProvider.notifier).setSession(
                        userId: me.id,
                        phoneNumber: me.phoneNumber,
                        tokens: tokens,
                    );
            } else {
                final result = await repo.signupComplete(
                    otpSessionToken: session,
                    pin: _pinController.text,
                    deviceId: deviceId,
                );
                await ref.read(authControllerProvider.notifier).setSession(
                        userId: result.user.id,
                        phoneNumber: result.user.phoneNumber,
                        tokens: result.tokens,
                    );
                if (mounted) await _offerBiometricEnroll();
            }
            ref.read(signupFlowStateProvider.notifier).reset();
            if (mounted) context.go('/');
        } catch (_) {
            setState(() => _error = 'PIN 설정에 실패했어요. 쉽게 추측되는 PIN(111111 등)은 사용할 수 없어요.');
        } finally {
            if (mounted) setState(() => _busy = false);
        }
    }

    Future<void> _offerBiometricEnroll() async {
        final auth = LocalAuthentication();
        bool supported;
        bool available;
        try {
            supported = await auth.isDeviceSupported();
            available = supported && await auth.canCheckBiometrics;
        } catch (_) {
            return;
        }
        if (!available || !mounted) return;
        final enroll = await showDialog<bool>(
            context: context,
            builder: (ctx) => AlertDialog(
                title: const Text('생체인식 사용'),
                content: const Text(
                    '다음 로그인부터 지문이나 얼굴인식으로 1초 만에 들어갈 수 있어요.\n'
                    '나중에 설정에서 끌 수 있습니다.',
                ),
                actions: [
                    TextButton(
                        onPressed: () => Navigator.pop(ctx, false),
                        child: const Text('건너뛰기'),
                    ),
                    FilledButton(
                        onPressed: () => Navigator.pop(ctx, true),
                        child: const Text('사용하기'),
                    ),
                ],
            ),
        );
        if (enroll != true) return;
        try {
            final ok = await auth.authenticate(
                localizedReason: '생체인식을 등록하려면 본인 확인이 필요해요.',
                options: const AuthenticationOptions(biometricOnly: true),
            );
            if (ok) {
                await ref.read(authPrefsProvider).setBiometricEnabled(true);
            }
        } catch (_) {
            // 등록 실패는 무시. 사용자는 PIN으로 계속 로그인 가능.
        }
    }

    @override
    void dispose() {
        _pinController.dispose();
        _confirmController.dispose();
        super.dispose();
    }

    @override
    Widget build(BuildContext context) {
        return Scaffold(
            appBar: AppBar(
                title: Text(widget.mode == 'reset' ? 'PIN 재설정' : 'PIN 설정'),
                automaticallyImplyLeading: widget.mode == 'reset',
            ),
            body: SafeArea(
                child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                            const Text('앞으로 로그인에 사용할 6자리 PIN을 설정해주세요.',
                                style: TextStyle(fontSize: 16)),
                            const SizedBox(height: 20),
                            _pinField(_pinController, 'PIN 6자리'),
                            const SizedBox(height: 12),
                            _pinField(_confirmController, '같은 PIN 한 번 더'),
                            if (_error != null)
                                Padding(
                                    padding: const EdgeInsets.only(top: 12),
                                    child: Text(_error!, style: const TextStyle(color: Colors.red)),
                                ),
                            const SizedBox(height: 24),
                            ElevatedButton(
                                onPressed: _busy ? null : _submit,
                                child: _busy
                                    ? const SizedBox(
                                        height: 18,
                                        width: 18,
                                        child: CircularProgressIndicator(strokeWidth: 2),
                                    )
                                    : Text(widget.mode == 'reset' ? 'PIN 재설정 완료' : '가입 완료'),
                            ),
                        ],
                    ),
                ),
            ),
        );
    }

    Widget _pinField(TextEditingController c, String label) {
        return TextField(
            controller: c,
            keyboardType: TextInputType.number,
            obscureText: true,
            maxLength: 6,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
        );
    }
}
