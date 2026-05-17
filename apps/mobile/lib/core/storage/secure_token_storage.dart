// JWT access/refresh 토큰의 보안 저장 인터페이스. 실제 저장 구현은 auth-login 슬러그에서 결합한다.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

abstract class SecureTokenStorage {
    Future<String?> readAccessToken();
    Future<String?> readRefreshToken();
    Future<void> write({
        required String accessToken,
        String? refreshToken,
    });
    Future<void> clear();
}

class FlutterSecureTokenStorage implements SecureTokenStorage {
    FlutterSecureTokenStorage([FlutterSecureStorage? storage])
        : _storage = storage ?? const FlutterSecureStorage();

    static const _accessKey = 'mc_access_token';
    static const _refreshKey = 'mc_refresh_token';

    final FlutterSecureStorage _storage;

    @override
    Future<String?> readAccessToken() => _storage.read(key: _accessKey);

    @override
    Future<String?> readRefreshToken() => _storage.read(key: _refreshKey);

    @override
    Future<void> write({
        required String accessToken,
        String? refreshToken,
    }) async {
        await _storage.write(key: _accessKey, value: accessToken);
        if (refreshToken != null) {
            await _storage.write(key: _refreshKey, value: refreshToken);
        }
    }

    @override
    Future<void> clear() async {
        await _storage.delete(key: _accessKey);
        await _storage.delete(key: _refreshKey);
    }
}

final secureTokenStorageProvider = Provider<SecureTokenStorage>((ref) {
    return FlutterSecureTokenStorage();
});
