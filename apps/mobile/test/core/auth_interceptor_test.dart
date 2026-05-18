// AuthInterceptor 401 → refresh 성공/실패 두 경로 통합 테스트.

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:my_closet_mobile/core/network/auth_interceptor.dart';
import 'package:my_closet_mobile/core/storage/secure_token_storage.dart';
import 'package:my_closet_mobile/features/auth/auth_state.dart';
import 'package:my_closet_mobile/features/auth/data/auth_api.dart';
import 'package:my_closet_mobile/features/auth/data/auth_prefs.dart';
import 'package:my_closet_mobile/features/auth/data/auth_repository.dart';

import '../helpers/memory_prefs.dart';

class _StubAdapter implements HttpClientAdapter {
    _StubAdapter(this._responder);
    final ResponseBody Function(RequestOptions options) _responder;
    int callCount = 0;

    @override
    void close({bool force = false}) {}

    @override
    Future<ResponseBody> fetch(
        RequestOptions options,
        Stream<List<int>>? requestStream,
        Future<void>? cancelFuture,
    ) async {
        callCount++;
        return _responder(options);
    }
}

class _MemoryStorage implements SecureTokenStorage {
    String? _access;
    String? _refresh;
    @override
    Future<String?> readAccessToken() async => _access;
    @override
    Future<String?> readRefreshToken() async => _refresh;
    @override
    Future<void> write({required String accessToken, String? refreshToken}) async {
        _access = accessToken;
        if (refreshToken != null) _refresh = refreshToken;
    }
    @override
    Future<void> clear() async {
        _access = null;
        _refresh = null;
    }
}

class _StubRepo implements AuthRepository {
    _StubRepo({this.nextToken});
    final String? nextToken;
    int refreshCalls = 0;

    @override
    Future<TokenPair> refresh(String refreshToken) async {
        refreshCalls++;
        if (nextToken == null) {
            throw Exception('refresh failed');
        }
        return TokenPair(accessToken: nextToken!, refreshToken: 'r-next');
    }

    @override
    Future<UserMe> me([String? bearer]) async =>
        const UserMe(id: 'u1', phoneNumber: '+821011112222');

    @override
    Future<void> logout(String refreshToken) async {}

    @override
    dynamic noSuchMethod(Invocation i) => super.noSuchMethod(i);
}

ResponseBody _body(int status, {String body = '{}'}) {
    return ResponseBody.fromString(
        body,
        status,
        headers: {
            Headers.contentTypeHeader: ['application/json'],
        },
    );
}

ProviderContainer _container({
    required SecureTokenStorage storage,
    required AuthRepository repo,
}) {
    return ProviderContainer(
        overrides: [
            secureTokenStorageProvider.overrideWithValue(storage),
            authRepositoryProvider.overrideWithValue(repo),
            authPrefsProvider.overrideWithValue(MemoryPrefs()),
        ],
    );
}

Dio _buildDio(ProviderContainer container, _StubAdapter adapter) {
    final dio = Dio(BaseOptions(baseUrl: 'https://api.test'));
    dio.httpClientAdapter = adapter;
    final dioProbe = Provider<Dio>((ref) {
        dio.interceptors.add(AuthInterceptor(retryDioFactory: () => dio));
        return dio;
    });
    container.read(dioProbe);
    return dio;
}

void main() {
    test('401 → refresh 성공 → 새 토큰으로 재시도 200', () async {
        final storage = _MemoryStorage();
        await storage.write(accessToken: 'OLD', refreshToken: 'R');
        final repo = _StubRepo(nextToken: 'NEW');
        final c = _container(storage: storage, repo: repo);
        addTearDown(c.dispose);
        // 초기 access 토큰을 상태로 부착.
        await c.read(authControllerProvider.notifier).restore();

        final adapter = _StubAdapter((options) {
            final auth = options.headers['Authorization'] as String?;
            if (auth == 'Bearer NEW') return _body(200);
            return _body(401);
        });
        final dio = _buildDio(c, adapter);

        final response = await dio.get<dynamic>('/x');
        expect(response.statusCode, 200);
        expect(repo.refreshCalls, greaterThanOrEqualTo(1));
        expect(c.read(authControllerProvider).status, AuthStatus.authenticated);
    });

    test('401 → refresh 실패 → signedOut 전이', () async {
        final storage = _MemoryStorage();
        await storage.write(accessToken: 'OLD', refreshToken: 'R');
        final repo = _StubRepo(nextToken: null);
        final c = _container(storage: storage, repo: repo);
        addTearDown(c.dispose);
        await c.read(authControllerProvider.notifier).restore();

        final adapter = _StubAdapter((_) => _body(401));
        final dio = _buildDio(c, adapter);

        await expectLater(dio.get<dynamic>('/x'), throwsA(isA<DioException>()));
        expect(c.read(authControllerProvider).status, AuthStatus.signedOut);
    });
}
