// 디바이스 고유 식별자 저장소. 최초 1회 SecureStorage에 UUID를 만들어 영구 보관한다.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DeviceIdStore {
    DeviceIdStore([FlutterSecureStorage? storage])
        : _storage = storage ?? const FlutterSecureStorage();

    static const _key = 'mc_device_id';

    final FlutterSecureStorage _storage;

    Future<String> getOrCreate() async {
        final existing = await _storage.read(key: _key);
        if (existing != null && existing.isNotEmpty) return existing;
        final created = _randomId();
        await _storage.write(key: _key, value: created);
        return created;
    }

    String _randomId() {
        final now = DateTime.now().microsecondsSinceEpoch.toRadixString(36);
        final rand =
            (DateTime.now().millisecondsSinceEpoch * 31 + 17).toRadixString(36);
        return 'd_${now}_$rand';
    }
}

final deviceIdStoreProvider = Provider<DeviceIdStore>((ref) {
    return DeviceIdStore();
});
