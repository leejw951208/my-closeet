// 가입 직전 "번호 = 계정" 강한 고지 + 동의 체크박스.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'signup_flow_state.dart';

class OnboardingConsentScreen extends ConsumerWidget {
    const OnboardingConsentScreen({super.key});

    @override
    Widget build(BuildContext context, WidgetRef ref) {
        final flow = ref.watch(signupFlowStateProvider);
        return Scaffold(
            appBar: AppBar(title: const Text('가입 안내'), automaticallyImplyLeading: false),
            body: SafeArea(
                child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                            const Text(
                                '꼭 알아두세요',
                                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                                '휴대폰 번호가 곧 계정입니다.\n\n번호를 바꾸시면 반드시 앱에서 먼저 변경해주세요. '
                                '번호를 바꾼 채로 새 기기로 이동하면 옷장 데이터를 복구할 수 없습니다.',
                                style: TextStyle(fontSize: 16, height: 1.5),
                            ),
                            const Spacer(),
                            CheckboxListTile(
                                value: flow.consented,
                                onChanged: (v) => ref
                                    .read(signupFlowStateProvider.notifier)
                                    .setConsent(v ?? false),
                                title: const Text('위 내용을 이해했고 동의합니다.'),
                                controlAffinity: ListTileControlAffinity.leading,
                            ),
                            ElevatedButton(
                                onPressed: flow.consented
                                    ? () => context.push('/auth/pin-setup')
                                    : null,
                                child: const Text('PIN 설정으로 이동'),
                            ),
                        ],
                    ),
                ),
            ),
        );
    }
}
