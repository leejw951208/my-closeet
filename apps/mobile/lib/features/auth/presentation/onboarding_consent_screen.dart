// 가입 직전 "번호 = 계정" 강한 고지 + 동의 체크박스. mockup Tr_OnbConsent 매핑.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/feature_chip.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/soft_card.dart';
import 'signup_flow_state.dart';

class OnboardingConsentScreen extends ConsumerWidget {
    const OnboardingConsentScreen({super.key});

    static const _features = [
        _Feature(FeatureChipVariant.peach, Icons.camera_alt_outlined,
            '사진 한 장으로 옷 등록', 'AI가 카테고리·색상 자동 분류'),
        _Feature(FeatureChipVariant.mint, Icons.style_outlined,
            '마네킹에 드래그해 코디', '4슬롯 · 셔플 추천'),
        _Feature(FeatureChipVariant.blue, Icons.calendar_today_outlined,
            '캘린더에 입은 옷 기록', '한 달이 한 눈에'),
        _Feature(FeatureChipVariant.lavender, Icons.share_outlined,
            'OOTD 한 번에 공유', '인스타·카톡으로 바로'),
    ];

    @override
    Widget build(BuildContext context, WidgetRef ref) {
        final flow = ref.watch(signupFlowStateProvider);
        return Scaffold(
            backgroundColor: AppColors.bg,
            body: SafeArea(
                child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                            const SizedBox(height: 40),
                            Center(
                                child: Container(
                                    width: 78,
                                    height: 78,
                                    decoration: BoxDecoration(
                                        color: AppColors.peach,
                                        borderRadius: BorderRadius.circular(22),
                                        boxShadow: AppShadows.elevate,
                                    ),
                                    child: const Icon(Icons.checkroom,
                                        size: 38, color: AppColors.peachInk),
                                ),
                            ),
                            const SizedBox(height: 20),
                            const Text(
                                '내 옷장을 휴대폰 속으로',
                                textAlign: TextAlign.center,
                                style: AppTypography.heading800,
                            ),
                            const SizedBox(height: 10),
                            const Text(
                                '사진으로 등록하고 코디를 만들어\n입은 날들을 자동으로 기록해요',
                                textAlign: TextAlign.center,
                                style: AppTypography.body500,
                            ),
                            const SizedBox(height: 32),
                            ..._features.map(_buildFeature),
                            const Spacer(),
                            SoftCard(
                                child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                        SizedBox(
                                            width: 24,
                                            child: Checkbox(
                                                value: flow.consented,
                                                onChanged: (v) => ref
                                                    .read(signupFlowStateProvider.notifier)
                                                    .setConsent(v ?? false),
                                                visualDensity: VisualDensity.compact,
                                                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                                activeColor: AppColors.peach,
                                                checkColor: AppColors.peachInk,
                                            ),
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                            child: Text.rich(
                                                TextSpan(
                                                    style: AppTypography.caption500,
                                                    children: [
                                                        const TextSpan(
                                                            text: '[필수] ',
                                                            style: TextStyle(
                                                                color: AppColors.ink,
                                                                fontWeight: FontWeight.w700,
                                                            ),
                                                        ),
                                                        const TextSpan(
                                                            text: '서비스 이용약관 · 개인정보 처리방침에 동의합니다.\n',
                                                        ),
                                                        TextSpan(
                                                            text: '[선택] 마케팅 정보 수신 동의',
                                                            style: AppTypography.caption500
                                                                .copyWith(color: AppColors.ink3),
                                                        ),
                                                    ],
                                                ),
                                            ),
                                        ),
                                    ],
                                ),
                            ),
                            const SizedBox(height: 12),
                            PrimaryButton(
                                label: '시작하기',
                                onPressed: flow.consented
                                    ? () => context.push('/auth/phone')
                                    : null,
                            ),
                            Padding(
                                padding: const EdgeInsets.only(top: 14, bottom: 16),
                                child: GestureDetector(
                                    onTap: () => context.go('/auth/pin-login'),
                                    child: const Text.rich(
                                        TextSpan(
                                            text: '이미 계정이 있어요 ',
                                            style: TextStyle(
                                                fontSize: 13,
                                                color: AppColors.ink2,
                                                fontWeight: FontWeight.w500,
                                            ),
                                            children: [
                                                TextSpan(
                                                    text: '로그인',
                                                    style: TextStyle(
                                                        color: AppColors.peachInk,
                                                        fontWeight: FontWeight.w700,
                                                    ),
                                                ),
                                            ],
                                        ),
                                        textAlign: TextAlign.center,
                                    ),
                                ),
                            ),
                        ],
                    ),
                ),
            ),
        );
    }

    Widget _buildFeature(_Feature f) {
        return Padding(
            padding: const EdgeInsets.symmetric(vertical: 5),
            child: Row(
                children: [
                    FeatureChip(variant: f.variant, icon: f.icon),
                    const SizedBox(width: 14),
                    Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                                Text(
                                    f.title,
                                    style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.ink,
                                    ),
                                ),
                                const SizedBox(height: 2),
                                Text(f.subtitle, style: AppTypography.caption500),
                            ],
                        ),
                    ),
                ],
            ),
        );
    }
}

class _Feature {
    const _Feature(this.variant, this.icon, this.title, this.subtitle);
    final FeatureChipVariant variant;
    final IconData icon;
    final String title;
    final String subtitle;
}
