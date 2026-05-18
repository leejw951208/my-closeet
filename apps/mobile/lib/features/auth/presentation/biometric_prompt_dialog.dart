// 생체인식 등록 다이얼로그. mockup Tr_OnbBio 매핑. 기기 미지원 시 다이얼로그 미노출.

import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/primary_button.dart';

/// PIN 설정 직후 호출. 다이얼로그 결과.
///   - true  → 생체인식 등록 성공
///   - false → 사용자가 "나중에" 선택
///   - null  → 기기 미지원 (다이얼로그 미노출)
Future<bool?> showBiometricPromptDialog(BuildContext context,
    {LocalAuthentication? auth}) async {
    final localAuth = auth ?? LocalAuthentication();
    bool available;
    try {
        final supported = await localAuth.isDeviceSupported();
        available = supported && await localAuth.canCheckBiometrics;
    } catch (_) {
        return null;
    }
    if (!available || !context.mounted) return null;

    final enroll = await showDialog<bool>(
        context: context,
        barrierColor: const Color(0x7314100A),
        builder: (ctx) => const _BiometricDialog(),
    );
    if (enroll != true) return false;
    try {
        final ok = await localAuth.authenticate(
            localizedReason: '생체인식을 등록하려면 본인 확인이 필요해요.',
            options: const AuthenticationOptions(biometricOnly: true),
        );
        return ok;
    } catch (_) {
        return false;
    }
}

class _BiometricDialog extends StatelessWidget {
    const _BiometricDialog();

    @override
    Widget build(BuildContext context) {
        return Dialog(
            backgroundColor: Colors.transparent,
            insetPadding: const EdgeInsets.symmetric(horizontal: 24),
            child: Container(
                padding: const EdgeInsets.fromLTRB(22, 28, 22, 18),
                decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(26),
                    boxShadow: AppShadows.elevate,
                ),
                child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                        Container(
                            width: 78,
                            height: 78,
                            decoration: BoxDecoration(
                                color: AppColors.bgSoft,
                                borderRadius: BorderRadius.circular(22),
                            ),
                            alignment: Alignment.center,
                            child: const Icon(Icons.face_retouching_natural,
                                size: 44, color: AppColors.ink),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                            '빠르게 로그인할까요?',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: AppColors.ink,
                                letterSpacing: -0.3,
                            ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                            '다음부터 PIN 입력 없이\n생체인식으로 잠금을 풀 수 있어요',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: AppColors.ink2,
                                height: 1.5,
                            ),
                        ),
                        const SizedBox(height: 22),
                        PrimaryButton(
                            label: '생체인식 등록',
                            onPressed: () => Navigator.of(context).pop(true),
                        ),
                        const SizedBox(height: 8),
                        TextButton(
                            onPressed: () => Navigator.of(context).pop(false),
                            style: TextButton.styleFrom(
                                foregroundColor: AppColors.ink2,
                                padding: const EdgeInsets.all(10),
                            ),
                            child: const Text(
                                '나중에 설정에서',
                                style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                ),
                            ),
                        ),
                    ],
                ),
            ),
        );
    }
}
