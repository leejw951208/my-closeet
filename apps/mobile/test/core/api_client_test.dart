// apiClientProvider가 인터셉터 체인을 올바르게 등록하는지 검증한다.

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:my_closet_mobile/core/network/api_client.dart';
import 'package:my_closet_mobile/core/network/auth_interceptor.dart';
import 'package:my_closet_mobile/core/network/error_interceptor.dart';

void main() {
    test('buildApiClient는 Auth/Error 인터셉터를 등록한다', () {
        final probe = Provider<Dio>((ref) {
            return buildApiClient(baseUrl: 'https://api.test');
        });
        final container = ProviderContainer();
        addTearDown(container.dispose);
        final dio = container.read(probe);
        expect(dio.options.baseUrl, 'https://api.test');
        expect(dio.interceptors.whereType<AuthInterceptor>().length, 1);
        expect(dio.interceptors.whereType<ErrorInterceptor>().length, 1);
    });
}
