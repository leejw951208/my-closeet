// 평소 로그인 화면. 부팅 시 생체인식 자동 시도(등록 시) → 실패·미등록 시 PIN 6자리 입력.

import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:local_auth/local_auth.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/soft_card.dart';
import '../auth_state.dart';
import '../data/auth_prefs.dart';
import '../data/auth_repository.dart';
import '../data/device_id_provider.dart';

class PinLoginScreen extends ConsumerStatefulWidget {
    const PinLoginScreen({super.key});

    @override
    ConsumerState<PinLoginScreen> createState() => _PinLoginScreenState();
}

class _PinLoginScreenState extends ConsumerState<PinLoginScreen> {
    final _phoneController = TextEditingController();
    final _pinController = TextEditingController();
    bool _busy = false;
    String? _error;
    bool _biometricTried = false;
    DateTime? _lockedUntil;
    Timer? _lockTicker;

    @override
    void initState() {
        super.initState();
        _phoneController.addListener(() => setState(() {}));
        _pinController.addListener(() => setState(() {}));
        WidgetsBinding.instance.addPostFrameCallback((_) => _tryBiometric());
    }

    Future<void> _tryBiometric() async {
        if (_biometricTried) return;
        _biometricTried = true;
        final enabled = await ref.read(authPrefsProvider).isBiometricEnabled();
        if (!enabled) return;
        final auth = LocalAuthentication();
        try {
            final supported = await auth.isDeviceSupported();
            if (!supported) return;
            final available = await auth.canCheckBiometrics;
            if (!available) return;
            final ok = await auth.authenticate(
                localizedReason: 'My Closet 로그인',
                options: const AuthenticationOptions(biometricOnly: true),
            );
            if (!ok) return;
            final refreshed =
                await ref.read(authControllerProvider.notifier).refreshToken();
            if (refreshed != null && mounted) {
                context.go('/');
            }
        } catch (_) {
            // 생체인식 실패는 조용히 PIN으로 fallback.
        }
    }

    Future<void> _submitPin() async {
        setState(() {
            _busy = true;
            _error = null;
        });
        try {
            final repo = ref.read(authRepositoryProvider);
            final deviceId = await ref.read(deviceIdStoreProvider).getOrCreate();
            final phone = _normalize(_phoneController.text.trim());
            final tokens = await repo.pinLogin(
                phoneNumber: phone,
                pin: _pinController.text,
                deviceId: deviceId,
            );
            final me = await repo.me(tokens.accessToken);
            await ref.read(authControllerProvider.notifier).setSession(
                    userId: me.id,
                    phoneNumber: me.phoneNumber,
                    tokens: tokens,
                    lastSignInAt: me.lastSignInAt,
                );
            if (mounted) context.go('/');
        } on DioException catch (e) {
            _handleLoginError(e);
        } catch (_) {
            setState(() {
                _error = '로그인에 실패했어요. 잠시 후 다시 시도해주세요.';
            });
        } finally {
            if (mounted) setState(() => _busy = false);
        }
    }

    void _handleLoginError(DioException e) {
        final res = e.response;
        if (res?.statusCode == 423) {
            final raw = res?.data;
            DateTime? until;
            if (raw is Map && raw['lockedUntil'] is String) {
                until = DateTime.tryParse(raw['lockedUntil'] as String);
            }
            setState(() {
                _lockedUntil = until ?? DateTime.now().add(const Duration(minutes: 10));
                _error = null;
            });
            _startLockTicker();
            return;
        }
        int? remaining;
        if (res?.data is Map) {
            final map = res!.data as Map;
            if (map['remainingAttempts'] is int) {
                remaining = map['remainingAttempts'] as int;
            }
        }
        setState(() {
            _error = remaining == null
                ? '휴대폰 번호 또는 PIN이 잘못되었어요.'
                : '휴대폰 번호 또는 PIN이 잘못되었어요. (남은 시도 $remaining회)';
        });
        if (remaining != null && remaining <= 2 && mounted) {
            _showResetHint();
        }
    }

    void _startLockTicker() {
        _lockTicker?.cancel();
        _lockTicker = Timer.periodic(const Duration(seconds: 1), (_) {
            if (!mounted) return;
            if (_lockedUntil != null && _lockedUntil!.isBefore(DateTime.now())) {
                setState(() {
                    _lockedUntil = null;
                });
                _lockTicker?.cancel();
            } else {
                setState(() {});
            }
        });
    }

    String _normalize(String raw) {
        final digits = raw.replaceAll(RegExp(r'\D'), '');
        if (digits.startsWith('010') && digits.length == 11) {
            return '+82${digits.substring(1)}';
        }
        return '+82$digits';
    }

    bool get _canSubmit {
        final phoneOk = _phoneController.text.replaceAll(RegExp(r'\D'), '').length >= 10;
        final pinOk = _pinController.text.length == 6;
        return phoneOk && pinOk && !_busy;
    }

    void _showResetHint() {
        showDialog<void>(
            context: context,
            builder: (ctx) => AlertDialog(
                title: const Text('PIN을 잊으셨나요?'),
                content: const Text(
                    '혹시 휴대폰 번호가 바뀌셨다면 SMS 재인증으로 PIN을 다시 설정할 수 있어요.',
                ),
                actions: [
                    TextButton(
                        onPressed: () => Navigator.pop(ctx),
                        child: const Text('계속 시도'),
                    ),
                    FilledButton(
                        onPressed: () {
                            Navigator.pop(ctx);
                            context.push('/auth/pin-reset');
                        },
                        child: const Text('SMS 재인증'),
                    ),
                ],
            ),
        );
    }

    @override
    void dispose() {
        _lockTicker?.cancel();
        _phoneController.dispose();
        _pinController.dispose();
        super.dispose();
    }

    @override
    Widget build(BuildContext context) {
        final lockedUntil = _lockedUntil;
        final locked = lockedUntil != null && lockedUntil.isAfter(DateTime.now());
        return Scaffold(
            backgroundColor: AppColors.bg,
            resizeToAvoidBottomInset: true,
            body: SafeArea(
                child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                            const SizedBox(height: 24),
                            Container(
                                width: 64,
                                height: 64,
                                decoration: BoxDecoration(
                                    color: AppColors.peach,
                                    borderRadius: BorderRadius.circular(18),
                                ),
                                alignment: Alignment.center,
                                child: const Icon(Icons.checkroom,
                                    size: 30, color: AppColors.peachInk),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                                '다시 만나서 반가워요',
                                style: AppTypography.headingMd800,
                            ),
                            const SizedBox(height: 8),
                            const Text(
                                '휴대폰 번호와 PIN을 입력해주세요',
                                style: AppTypography.body500,
                            ),
                            const SizedBox(height: 28),
                            if (locked)
                                _lockedBanner(lockedUntil)
                            else
                                ..._loginFields(),
                            const Spacer(),
                            TextButton(
                                onPressed: () => context.push('/auth/phone'),
                                style: TextButton.styleFrom(
                                    foregroundColor: AppColors.ink2,
                                ),
                                child: const Text('처음이신가요? 가입하기'),
                            ),
                            TextButton(
                                onPressed: () => context.push('/auth/pin-reset'),
                                style: TextButton.styleFrom(
                                    foregroundColor: AppColors.peachInk,
                                ),
                                child: const Text('PIN을 잊으셨나요?'),
                            ),
                        ],
                    ),
                ),
            ),
        );
    }

    Widget _lockedBanner(DateTime until) {
        final remain = until.difference(DateTime.now());
        final mm = remain.inMinutes.remainder(60).toString().padLeft(2, '0');
        final ss = remain.inSeconds.remainder(60).toString().padLeft(2, '0');
        return SoftCard(
            color: const Color(0xFFFCE7E5),
            padding: const EdgeInsets.all(16),
            child: Column(
                children: [
                    const Text(
                        'PIN 잠금',
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF9F2A1E),
                        ),
                    ),
                    const SizedBox(height: 8),
                    Text('잠금 해제까지 $mm:$ss',
                        style: const TextStyle(color: Color(0xFF9F2A1E))),
                    const SizedBox(height: 12),
                    PrimaryButton(
                        label: 'SMS 재인증으로 PIN 재설정',
                        onPressed: () => context.push('/auth/pin-reset'),
                    ),
                ],
            ),
        );
    }

    List<Widget> _loginFields() {
        return [
            _LoginField(
                controller: _phoneController,
                hint: '010 1234 5678',
                prefixText: '+82  ',
                keyboardType: TextInputType.phone,
                maxLength: 11,
            ),
            const SizedBox(height: 12),
            _LoginField(
                controller: _pinController,
                hint: 'PIN 6자리',
                keyboardType: TextInputType.number,
                obscureText: true,
                maxLength: 6,
            ),
            if (_error != null)
                Padding(
                    padding: const EdgeInsets.only(top: 12),
                    child: Text(_error!,
                        style: const TextStyle(color: Color(0xFFB3261E))),
                ),
            const SizedBox(height: 20),
            PrimaryButton(
                label: '로그인',
                busy: _busy,
                onPressed: _canSubmit ? _submitPin : null,
            ),
        ];
    }
}

class _LoginField extends StatelessWidget {
    const _LoginField({
        required this.controller,
        required this.hint,
        this.prefixText,
        this.keyboardType,
        this.obscureText = false,
        this.maxLength,
    });

    final TextEditingController controller;
    final String hint;
    final String? prefixText;
    final TextInputType? keyboardType;
    final bool obscureText;
    final int? maxLength;

    @override
    Widget build(BuildContext context) {
        return Container(
            decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(16),
                boxShadow: AppShadows.card,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: TextField(
                controller: controller,
                keyboardType: keyboardType,
                obscureText: obscureText,
                maxLength: maxLength,
                style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                    letterSpacing: 0.4,
                ),
                inputFormatters: keyboardType == TextInputType.number ||
                        keyboardType == TextInputType.phone
                    ? [
                          FilteringTextInputFormatter.digitsOnly,
                          if (maxLength != null) LengthLimitingTextInputFormatter(maxLength!),
                      ]
                    : null,
                decoration: InputDecoration(
                    hintText: hint,
                    prefixText: prefixText,
                    border: InputBorder.none,
                    isCollapsed: true,
                    counterText: '',
                    contentPadding: const EdgeInsets.symmetric(vertical: 14),
                ),
            ),
        );
    }
}
