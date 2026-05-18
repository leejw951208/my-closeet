// 휴대폰 번호 변경 화면. 구 번호 SMS 인증 → 새 번호 SMS 인증 → phone/change.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../auth_state.dart';
import '../data/auth_repository.dart';

class PhoneChangeScreen extends ConsumerStatefulWidget {
    const PhoneChangeScreen({super.key});

    @override
    ConsumerState<PhoneChangeScreen> createState() => _PhoneChangeScreenState();
}

class _PhoneChangeScreenState extends ConsumerState<PhoneChangeScreen> {
    String? _currentRequestId;
    String? _currentSession;
    final _currentCodeCtl = TextEditingController();
    final _newPhoneCtl = TextEditingController();
    final _newCodeCtl = TextEditingController();
    String? _newRequestId;
    bool _busy = false;
    String? _error;

    String _normalize(String raw) {
        final digits = raw.replaceAll(RegExp(r'\D'), '');
        if (digits.startsWith('010') && digits.length == 11) {
            return '+82${digits.substring(1)}';
        }
        return '+82$digits';
    }

    Future<void> _run(Future<void> Function() body) async {
        setState(() {
            _busy = true;
            _error = null;
        });
        try {
            await body();
        } catch (_) {
            setState(() => _error = '요청 실패. 잠시 후 다시 시도해주세요.');
        } finally {
            if (mounted) setState(() => _busy = false);
        }
    }

    @override
    void dispose() {
        _currentCodeCtl.dispose();
        _newPhoneCtl.dispose();
        _newCodeCtl.dispose();
        super.dispose();
    }

    @override
    Widget build(BuildContext context) {
        final repo = ref.read(authRepositoryProvider);
        final auth = ref.watch(authControllerProvider);
        return Scaffold(
            appBar: AppBar(title: const Text('휴대폰 번호 변경')),
            body: SafeArea(
                child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: SingleChildScrollView(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                                Text('현재 번호. ${auth.phoneNumber ?? "-"}'),
                                const SizedBox(height: 12),
                                ElevatedButton(
                                    onPressed: _busy
                                        ? null
                                        : () => _run(() async {
                                              final r = await repo.sendOtp(
                                                  auth.phoneNumber!, 'PHONE_CHANGE');
                                              setState(() {
                                                  _currentRequestId = r.requestId;
                                              });
                                          }),
                                    child: const Text('1) 현재 번호로 인증번호 발송'),
                                ),
                                const SizedBox(height: 8),
                                TextField(
                                    controller: _currentCodeCtl,
                                    enabled: _currentRequestId != null,
                                    keyboardType: TextInputType.number,
                                    maxLength: 6,
                                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                                    decoration: const InputDecoration(
                                        labelText: '현재 번호 인증번호',
                                        border: OutlineInputBorder(),
                                    ),
                                ),
                                ElevatedButton(
                                    onPressed: _currentRequestId == null || _busy
                                        ? null
                                        : () => _run(() async {
                                              final v = await repo.verifyOtp(
                                                  requestId: _currentRequestId!,
                                                  code: _currentCodeCtl.text,
                                                  purpose: 'PHONE_CHANGE');
                                              setState(() {
                                                  _currentSession = v.otpSessionToken;
                                              });
                                          }),
                                    child: const Text('2) 현재 번호 인증 확인'),
                                ),
                                const Divider(height: 32),
                                TextField(
                                    controller: _newPhoneCtl,
                                    enabled: _currentSession != null,
                                    keyboardType: TextInputType.phone,
                                    inputFormatters: [
                                        FilteringTextInputFormatter.digitsOnly,
                                        LengthLimitingTextInputFormatter(11),
                                    ],
                                    decoration: const InputDecoration(
                                        labelText: '새 번호 (010...)',
                                        prefixText: '+82 ',
                                        border: OutlineInputBorder(),
                                    ),
                                ),
                                ElevatedButton(
                                    onPressed: _currentSession == null || _busy
                                        ? null
                                        : () => _run(() async {
                                              final phone = _normalize(_newPhoneCtl.text.trim());
                                              final r = await repo.sendOtp(phone, 'PHONE_CHANGE');
                                              setState(() {
                                                  _newRequestId = r.requestId;
                                              });
                                          }),
                                    child: const Text('3) 새 번호로 인증번호 발송'),
                                ),
                                const SizedBox(height: 8),
                                TextField(
                                    controller: _newCodeCtl,
                                    enabled: _newRequestId != null,
                                    keyboardType: TextInputType.number,
                                    maxLength: 6,
                                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                                    decoration: const InputDecoration(
                                        labelText: '새 번호 인증번호',
                                        border: OutlineInputBorder(),
                                    ),
                                ),
                                ElevatedButton(
                                    onPressed: _newRequestId == null || _busy
                                        ? null
                                        : () => _run(() async {
                                              final v = await repo.verifyOtp(
                                                  requestId: _newRequestId!,
                                                  code: _newCodeCtl.text,
                                                  purpose: 'PHONE_CHANGE');
                                              await repo.changePhone(
                                                  currentOtpSessionToken: _currentSession!,
                                                  newOtpSessionToken: v.otpSessionToken);
                                              // 전체 refresh token 무효화로 인해 재로그인.
                                              await ref
                                                  .read(authControllerProvider.notifier)
                                                  .signOut();
                                              if (mounted) context.go('/auth/phone');
                                          }),
                                    child: const Text('4) 번호 변경 완료'),
                                ),
                                if (_error != null)
                                    Padding(
                                        padding: const EdgeInsets.only(top: 12),
                                        child: Text(_error!, style: const TextStyle(color: Colors.red)),
                                    ),
                            ],
                        ),
                    ),
                ),
            ),
        );
    }
}
