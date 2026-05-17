// AuthInterceptor 401 → refresh 성공/실패 두 경로 통합 테스트.

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:my_closet_mobile/core/network/auth_interceptor.dart';
import 'package:my_closet_mobile/features/auth/auth_state.dart';

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

class _RefreshController extends AuthController {
    _RefreshController({required this.nextToken});
    final String? nextToken;
    int refreshCalls = 0;

    @override
    Future<String?> refreshToken() async {
        refreshCalls++;
        if (nextToken != null) {
            signIn(userId: 'u1', accessToken: nextToken!);
        }
        return nextToken;
    }
}

ProviderContainer _buildContainer(_RefreshController controller) {
    final container = ProviderContainer(
        overrides: [
            authControllerProvider.overrideWith((ref) => controller),
        ],
    );
    return container;
}

Dio _buildDio({
    required ProviderContainer container,
    required _StubAdapter adapter,
}) {
    final dio = Dio(BaseOptions(baseUrl: 'https://api.test'));
    dio.httpClientAdapter = adapter;
    final dioProbe = Provider<Dio>((ref) {
        dio.interceptors.add(
            AuthInterceptor(ref, retryDioFactory: () => dio),
        );
        return dio;
    });
    container.read(dioProbe);
    return dio;
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

void main() {
    test('401 → refresh 성공 → 새 토큰으로 재시도 200', () async {
        final controller = _RefreshController(nextToken: 'NEW');
        controller.signIn(userId: 'u1', accessToken: 'OLD');
        final container = _buildContainer(controller);
        addTearDown(container.dispose);

        final adapter = _StubAdapter((options) {
            final auth = options.headers['Authorization'] as String?;
            if (auth == 'Bearer NEW') return _body(200);
            return _body(401);
        });
        final dio = _buildDio(container: container, adapter: adapter);

        final response = await dio.get<dynamic>('/x');
        expect(response.statusCode, 200);
        expect(controller.refreshCalls, 1);
        expect(adapter.callCount, 2);
        expect(container.read(authControllerProvider).status, AuthStatus.signedIn);
    });

    test('401 → refresh 실패 → signedOut 전이', () async {
        final controller = _RefreshController(nextToken: null);
        controller.signIn(userId: 'u1', accessToken: 'OLD');
        final container = _buildContainer(controller);
        addTearDown(container.dispose);

        final adapter = _StubAdapter((options) => _body(401));
        final dio = _buildDio(container: container, adapter: adapter);

        await expectLater(
            dio.get<dynamic>('/x'),
            throwsA(isA<DioException>()),
        );
        expect(controller.refreshCalls, 1);
        expect(container.read(authControllerProvider).status, AuthStatus.signedOut);
    });
}
