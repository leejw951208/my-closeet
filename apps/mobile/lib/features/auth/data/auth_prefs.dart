// 인증 부속 환경설정. 생체인식 등록 플래그와 30일 배너 dismiss 일자를 SecureStorage에 보관한다.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthPrefs {
    AuthPrefs([FlutterSecureStorage? storage])
        : _storage = storage ?? const FlutterSecureStorage();

    static const _biometricKey = 'mc_biometric_enabled';
    static const _bannerKey = 'mc_stale_banner_dismissed_date';

    final FlutterSecureStorage _storage;

    Future<bool> isBiometricEnabled() async {
        return (await _storage.read(key: _biometricKey)) == '1';
    }

    Future<void> setBiometricEnabled(bool value) async {
        await _storage.write(key: _biometricKey, value: value ? '1' : '0');
    }

    Future<String?> readBannerDismissedDate() => _storage.read(key: _bannerKey);

    Future<void> markBannerDismissedToday() async {
        final today = DateTime.now().toIso8601String().substring(0, 10);
        await _storage.write(key: _bannerKey, value: today);
    }
}

final authPrefsProvider = Provider<AuthPrefs>((ref) => AuthPrefs());
