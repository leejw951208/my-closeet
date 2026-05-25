// SMS OTP 6자리 입력 화면. 재발송 1분 쿨다운, 5분 만료 카운트다운. mockup Tr_OnbSms 매핑.

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/auth_back_button.dart';
import '../../../shared/widgets/auth_step_bar.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/soft_card.dart';
import '../auth_state.dart';
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
  final _focusNode = FocusNode();
  Timer? _ticker;
  int _expiresInSec = 300;
  int _cooldownSec = 60;
  bool _busy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _startTicker();
    _controller.addListener(() => setState(() {}));
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _autofillDevCode();
      _focusNode.requestFocus();
    });
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
      } else if (!result.isNewUser) {
        final phoneNumber = flow.phoneNumber;
        if (phoneNumber != null) {
          await ref
              .read(authControllerProvider.notifier)
              .rememberLastPhoneNumber(phoneNumber);
        }
        if (!mounted) return;
        context.go('/auth/pin-login');
      } else {
        context.push('/auth/pin-setup');
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
      ref.read(signupFlowStateProvider.notifier).startOtp(
          phoneNumber: flow.phoneNumber!, requestId: result.requestId);
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
    _focusNode.dispose();
    _controller.dispose();
    super.dispose();
  }

  String _maskPhone(String? p) {
    if (p == null || p.isEmpty) return '-';
    if (p.startsWith('+82') && p.length >= 12) {
      final tail = p.substring(3);
      final m = RegExp(r'^(\d{1,2})(\d{4})(\d{4})$').firstMatch(tail);
      if (m != null) {
        return '+82 ${m[1]}-${m[2]}-${m[3]}';
      }
    }
    return p;
  }

  String _mmss(int sec) {
    final mm = (sec ~/ 60).toString().padLeft(2, '0');
    final ss = (sec % 60).toString().padLeft(2, '0');
    return '$mm:$ss';
  }

  @override
  Widget build(BuildContext context) {
    final flow = ref.watch(signupFlowStateProvider);
    final code = _controller.text;
    return Scaffold(
      backgroundColor: AppColors.bg,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AuthBackButton(
                  onTap: context.canPop() ? () => context.pop() : null),
              const AuthStepBar(active: 2),
              const SizedBox(height: 28),
              const Text('받으신 인증번호를\n입력해주세요', style: AppTypography.heading800),
              const SizedBox(height: 10),
              Wrap(
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  Text(
                    '${_maskPhone(flow.phoneNumber)} 으로 보냈어요 · ',
                    style: AppTypography.body500,
                  ),
                  GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: context.canPop()
                        ? () => context.pop()
                        : () => context.go('/auth/phone'),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 4),
                      child: Text(
                        '번호 변경',
                        style: TextStyle(
                          color: AppColors.peachInk,
                          fontWeight: FontWeight.w700,
                          decoration: TextDecoration.underline,
                          decorationColor: AppColors.peachInk,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              if (flow.devCode != null) ...[
                const SizedBox(height: 12),
                SoftCard(
                  color: AppColors.devNotice,
                  child: Text(
                    'DEV 모드. 인증번호가 자동 입력되었어요 (${flow.devCode}).',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.ink,
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 32),
              GestureDetector(
                onTap: () => _focusNode.requestFocus(),
                child: _OtpCells(code: code, focused: _focusNode.hasFocus),
              ),
              // RenderEditable이 layout되어야 IME 연결이 정상 작동한다. Offstage 대신 화면 밖으로 옮긴 1×1 투명 TextField.
              SizedBox(
                height: 1,
                child: Opacity(
                  opacity: 0,
                  child: TextField(
                    controller: _controller,
                    focusNode: _focusNode,
                    keyboardType: TextInputType.number,
                    autofocus: true,
                    maxLength: 6,
                    showCursor: false,
                    enableInteractiveSelection: false,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(6),
                    ],
                    decoration: const InputDecoration(
                      counterText: '',
                      border: InputBorder.none,
                      isCollapsed: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                    onChanged: (value) {
                      if (value.length == 6 && !_busy) _verify();
                    },
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Center(
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: '남은 시간 ${_mmss(_expiresInSec)}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.ink2,
                          fontFamilyFallback: ['Menlo', 'monospace'],
                        ),
                      ),
                      const TextSpan(
                        text: '   ·   ',
                        style: TextStyle(color: AppColors.ink3),
                      ),
                      WidgetSpan(
                        alignment: PlaceholderAlignment.middle,
                        child: GestureDetector(
                          onTap: _cooldownSec > 0 ? null : _resend,
                          child: Text(
                            _cooldownSec > 0
                                ? '$_cooldownSec초 후 재발송'
                                : '인증번호 다시 받기',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: _cooldownSec > 0
                                  ? AppColors.ink3
                                  : AppColors.peachInk,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(_error!,
                      style: const TextStyle(color: Color(0xFFB3261E))),
                ),
              const Spacer(),
              PrimaryButton(
                label: '다음',
                busy: _busy,
                onPressed: (!_busy && code.length == 6) ? _verify : null,
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}

class _OtpCells extends StatelessWidget {
  const _OtpCells({required this.code, required this.focused});
  final String code;
  final bool focused;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(6, (i) {
        final char = i < code.length ? code[i] : '';
        final active = focused && i == code.length;
        return Expanded(
          child: Container(
            margin: EdgeInsets.only(right: i == 5 ? 0 : 8),
            height: 60,
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(14),
              boxShadow: AppShadows.card,
              border: Border.all(
                color: active ? AppColors.peachInk : Colors.transparent,
                width: 2,
              ),
            ),
            alignment: Alignment.center,
            child: Text(
              char,
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: AppColors.ink,
              ),
            ),
          ),
        );
      }),
    );
  }
}
