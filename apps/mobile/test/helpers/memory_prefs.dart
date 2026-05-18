// AuthPrefs 메모리 fake. 테스트에서 SecureStorage 채널 호출을 피하기 위해 사용.

import 'package:my_closet_mobile/features/auth/data/auth_prefs.dart';

class MemoryPrefs implements AuthPrefs {
    String? _phone;
    bool _bio = false;
    String? _banner;
    @override
    Future<String?> readLastPhoneNumber() async => _phone;
    @override
    Future<void> writeLastPhoneNumber(String phoneNumber) async {
        _phone = phoneNumber;
    }
    @override
    Future<void> clearLastPhoneNumber() async {
        _phone = null;
    }
    @override
    Future<bool> isBiometricEnabled() async => _bio;
    @override
    Future<void> setBiometricEnabled(bool value) async {
        _bio = value;
    }
    @override
    Future<String?> readBannerDismissedDate() async => _banner;
    @override
    Future<void> markBannerDismissedToday() async {
        _banner = DateTime.now().toIso8601String().substring(0, 10);
    }
    @override
    dynamic noSuchMethod(Invocation i) => super.noSuchMethod(i);
}
