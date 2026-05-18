// PIN 6자리 등록 화면. 가입 완료(/auth/signup/complete) 또는 재설정(/auth/pin/reset)을 호출한다. mockup Tr_OnbPinSet 매핑.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/auth_back_button.dart';
import '../../../shared/widgets/auth_step_bar.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/soft_card.dart';
import '../auth_state.dart';
import '../data/auth_prefs.dart';
import '../data/auth_repository.dart';
import '../data/device_id_provider.dart';
import 'biometric_prompt_dialog.dart';
import 'signup_flow_state.dart';

class PinSetupScreen extends ConsumerStatefulWidget {
    const PinSetupScreen({super.key, this.mode = 'signup'});
    final String mode;

    @override
    ConsumerState<PinSetupScreen> createState() => _PinSetupScreenState();
}

enum _PinStage { entry, confirm }

class _PinSetupScreenState extends ConsumerState<PinSetupScreen> {
    final _pinController = TextEditingController();
    final _confirmController = TextEditingController();
    final _focusEntry = FocusNode();
    final _focusConfirm = FocusNode();
    _PinStage _stage = _PinStage.entry;
    bool _busy = false;
    String? _error;

    @override
    void initState() {
        super.initState();
        _pinController.addListener(_onEntryChanged);
        _confirmController.addListener(() => setState(() {}));
        WidgetsBinding.instance.addPostFrameCallback((_) => _focusEntry.requestFocus());
    }

    void _onEntryChanged() {
        setState(() {});
        if (_pinController.text.length == 6 && _stage == _PinStage.entry) {
            setState(() => _stage = _PinStage.confirm);
            WidgetsBinding.instance.addPostFrameCallback((_) => _focusConfirm.requestFocus());
        }
    }

    Future<void> _submit() async {
        if (_pinController.text != _confirmController.text) {
            HapticFeedback.heavyImpact();
            setState(() {
                _error = '두 번 입력한 PIN이 달라요.';
                _confirmController.clear();
                _stage = _PinStage.entry;
                _pinController.clear();
            });
            _focusEntry.requestFocus();
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
                if (mounted) {
                    final enrolled = await showBiometricPromptDialog(context);
                    if (enrolled == true) {
                        await ref.read(authPrefsProvider).setBiometricEnabled(true);
                    }
                }
            }
            ref.read(signupFlowStateProvider.notifier).reset();
            if (mounted) context.go('/');
        } catch (_) {
            setState(() => _error = 'PIN 설정에 실패했어요. 쉽게 추측되는 PIN(111111 등)은 사용할 수 없어요.');
        } finally {
            if (mounted) setState(() => _busy = false);
        }
    }

    @override
    void dispose() {
        _focusEntry.dispose();
        _focusConfirm.dispose();
        _pinController.dispose();
        _confirmController.dispose();
        super.dispose();
    }

    @override
    Widget build(BuildContext context) {
        final isReset = widget.mode == 'reset';
        final inConfirm = _stage == _PinStage.confirm;
        final activeLen = inConfirm ? _confirmController.text.length : _pinController.text.length;
        final canSubmit = !_busy &&
            _pinController.text.length == 6 &&
            _confirmController.text.length == 6;
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
                                onTap: isReset || context.canPop() ? () => context.pop() : null,
                            ),
                            const AuthStepBar(active: 3),
                            const SizedBox(height: 28),
                            const Center(
                                child: Text('앱 잠금용 PIN 설정',
                                    style: AppTypography.headingMd800),
                            ),
                            const SizedBox(height: 8),
                            Center(
                                child: Text(
                                    inConfirm ? '한 번 더 입력해 확인해주세요' : 'PIN 6자리를 입력해주세요',
                                    style: AppTypography.body500,
                                ),
                            ),
                            const SizedBox(height: 36),
                            GestureDetector(
                                onTap: () => _focusEntry.requestFocus(),
                                behavior: HitTestBehavior.opaque,
                                child: _PinRow(
                                    label: '1차 입력',
                                    length: _pinController.text.length,
                                    completed: _pinController.text.length == 6,
                                    active: !inConfirm,
                                ),
                            ),
                            const SizedBox(height: 22),
                            GestureDetector(
                                onTap: () => _focusConfirm.requestFocus(),
                                behavior: HitTestBehavior.opaque,
                                child: _PinRow(
                                    label: '2차 확인',
                                    length: _confirmController.text.length,
                                    completed: _confirmController.text.length == 6 &&
                                        _confirmController.text == _pinController.text,
                                    active: inConfirm,
                                ),
                            ),
                            // 시스템 키보드 입력만 받는 숨김 TextField. RenderEditable이 layout되어야 IME가 정상 동작하므로 1×1 투명으로 노출한다.
                            SizedBox(
                                height: 1,
                                child: Row(
                                    children: [
                                        Expanded(child: _hiddenInput(_pinController, _focusEntry)),
                                        Expanded(child: _hiddenInput(_confirmController, _focusConfirm)),
                                    ],
                                ),
                            ),
                            const SizedBox(height: 26),
                            const SoftCard(
                                child: Text(
                                    '쉽게 추측 가능한 번호는 피해주세요 (생년월일·연속된 숫자 등). PIN은 기기 안에서만 안전하게 저장돼요.',
                                    style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                        color: AppColors.ink2,
                                        height: 1.55,
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
                                label: isReset ? 'PIN 재설정 완료' : '가입 완료',
                                busy: _busy,
                                onPressed: canSubmit ? _submit : null,
                            ),
                            const SizedBox(height: 12),
                            Center(
                                child: Text(
                                    activeLen == 0
                                        ? '키보드로 PIN을 입력해주세요'
                                        : '$activeLen / 6 자리 입력됨',
                                    style: AppTypography.caption500,
                                ),
                            ),
                            const SizedBox(height: 8),
                        ],
                    ),
                ),
            ),
        );
    }

    Widget _hiddenInput(TextEditingController c, FocusNode f) {
        return Opacity(
            opacity: 0,
            child: TextField(
                controller: c,
                focusNode: f,
                keyboardType: TextInputType.number,
                obscureText: true,
                maxLength: 6,
                autofocus: false,
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
            ),
        );
    }
}

class _PinRow extends StatelessWidget {
    const _PinRow({
        required this.label,
        required this.length,
        required this.completed,
        required this.active,
    });
    final String label;
    final int length;
    final bool completed;
    final bool active;

    @override
    Widget build(BuildContext context) {
        return Row(
            children: [
                SizedBox(
                    width: 64,
                    child: Text(
                        label,
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: active ? AppColors.ink : AppColors.ink2,
                        ),
                    ),
                ),
                const SizedBox(width: 12),
                Expanded(
                    child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                            for (var i = 0; i < 6; i++) ...[
                                Container(
                                    width: 12,
                                    height: 12,
                                    decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: i < length
                                            ? (completed
                                                ? AppColors.mintInk.withValues(alpha: 0.6)
                                                : AppColors.peachInk)
                                            : AppColors.line,
                                    ),
                                ),
                                if (i != 5) const SizedBox(width: 8),
                            ],
                            if (completed) ...[
                                const SizedBox(width: 8),
                                const Icon(Icons.check,
                                    size: 14, color: AppColors.mintInk),
                            ],
                        ],
                    ),
                ),
                const SizedBox(width: 64),
            ],
        );
    }
}
