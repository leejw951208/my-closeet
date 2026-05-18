// 평소 로그인 화면. 부팅 시 생체인식 자동 시도(등록 시) → 실패·미등록 시 PIN 6자리 입력.
// 휴대폰 번호는 마지막 로그인 값을 SecureStorage(authPrefs)에서 가져와 자동 사용한다(mockup 1.6).

import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:local_auth/local_auth.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/num_pad.dart';
import '../../../shared/widgets/pin_dots.dart';
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
    final List<String> _digits = [];
    bool _busy = false;
    String? _error;
    bool _biometricTried = false;
    DateTime? _lockedUntil;
    Timer? _lockTicker;

    @override
    void initState() {
        super.initState();
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

    void _onDigit(String d) {
        if (_busy) return;
        if (_digits.length >= 6) return;
        setState(() {
            _digits.add(d);
            _error = null;
        });
        if (_digits.length == 6) {
            _submitPin();
        }
    }

    void _onDelete() {
        if (_busy) return;
        if (_digits.isEmpty) return;
        setState(() => _digits.removeLast());
    }

    void _resetInput() {
        setState(() => _digits.clear());
    }

    Future<void> _submitPin() async {
        final phone = ref.read(authControllerProvider).lastKnownPhoneNumber;
        if (phone == null) {
            // 안전망: 마지막 번호가 없으면 가입 흐름으로.
            if (mounted) context.go('/auth/onboarding-consent');
            return;
        }
        setState(() {
            _busy = true;
            _error = null;
        });
        try {
            final repo = ref.read(authRepositoryProvider);
            final deviceId = await ref.read(deviceIdStoreProvider).getOrCreate();
            final tokens = await repo.pinLogin(
                phoneNumber: phone,
                pin: _digits.join(),
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
            HapticFeedback.heavyImpact();
            setState(() {
                _error = '로그인에 실패했어요. 잠시 후 다시 시도해주세요.';
            });
            _resetInput();
        } finally {
            if (mounted) setState(() => _busy = false);
        }
    }

    void _handleLoginError(DioException e) {
        HapticFeedback.heavyImpact();
        _resetInput();
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
                ? 'PIN이 일치하지 않아요.'
                : 'PIN이 일치하지 않아요. (남은 시도 $remaining회)';
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
        super.dispose();
    }

    @override
    Widget build(BuildContext context) {
        final lockedUntil = _lockedUntil;
        final locked = lockedUntil != null && lockedUntil.isAfter(DateTime.now());
        final phone = ref.watch(authControllerProvider).lastKnownPhoneNumber;
        final greetingTail = _maskedPhoneTail(phone);
        return Scaffold(
            backgroundColor: AppColors.bg,
            body: SafeArea(
                child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                            const SizedBox(height: 28),
                            Center(
                                child: Container(
                                    width: 56,
                                    height: 56,
                                    decoration: BoxDecoration(
                                        color: AppColors.peach,
                                        borderRadius: BorderRadius.circular(16),
                                    ),
                                    alignment: Alignment.center,
                                    child: const Icon(Icons.checkroom,
                                        size: 28, color: AppColors.peachInk),
                                ),
                            ),
                            const SizedBox(height: 28),
                            Center(
                                child: Text(
                                    greetingTail != null
                                        ? '$greetingTail님, 다시 오셨어요'
                                        : '다시 만나서 반가워요',
                                    style: AppTypography.headingMd800,
                                ),
                            ),
                            const SizedBox(height: 8),
                            const Center(
                                child: Text(
                                    '6자리 비밀번호를 입력해주세요',
                                    style: AppTypography.body500,
                                ),
                            ),
                            const SizedBox(height: 36),
                            if (locked)
                                _lockedBanner(lockedUntil)
                            else ...[
                                PinDots(length: _digits.length),
                                if (_error != null) ...[
                                    const SizedBox(height: 16),
                                    Center(
                                        child: Text(
                                            _error!,
                                            style: const TextStyle(
                                                color: Color(0xFFB3261E),
                                                fontSize: 13,
                                                fontWeight: FontWeight.w500,
                                            ),
                                        ),
                                    ),
                                ],
                            ],
                            const Spacer(),
                            if (!locked)
                                NumPad(
                                    onDigit: _onDigit,
                                    onDelete: _onDelete,
                                    onBio: _tryBiometric,
                                ),
                            const SizedBox(height: 12),
                            TextButton(
                                onPressed: () => context.push('/auth/phone'),
                                style: TextButton.styleFrom(
                                    foregroundColor: AppColors.ink2,
                                ),
                                child: const Text.rich(
                                    TextSpan(
                                        text: '처음이신가요? ',
                                        children: [
                                            TextSpan(
                                                text: '가입하기',
                                                style: TextStyle(
                                                    color: AppColors.peachInk,
                                                    fontWeight: FontWeight.w700,
                                                ),
                                            ),
                                        ],
                                    ),
                                ),
                            ),
                            TextButton(
                                onPressed: () => context.push('/auth/pin-reset'),
                                style: TextButton.styleFrom(
                                    foregroundColor: AppColors.peachInk,
                                ),
                                child: const Text('PIN을 잊으셨나요?'),
                            ),
                            const SizedBox(height: 8),
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
                    Text(
                        '$mm:$ss 후에 다시 시도하거나 SMS 재인증으로 PIN을 재설정하세요.',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                            fontSize: 13,
                            color: Color(0xFF9F2A1E),
                        ),
                    ),
                ],
            ),
        );
    }
}

/// 휴대폰 번호의 마지막 4자리를 반환. mockup의 "지윤님" 자리에 임시 표시 용도.
String? _maskedPhoneTail(String? phone) {
    if (phone == null || phone.isEmpty) return null;
    final digits = phone.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 4) return null;
    return digits.substring(digits.length - 4);
}
