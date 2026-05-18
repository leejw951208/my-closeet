// Dio 클라이언트 팩토리와 Provider.

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../env/app_env.dart';
import 'auth_interceptor.dart';
import 'error_interceptor.dart';

Dio buildApiClient({required String baseUrl}) {
    final dio = Dio(
        BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 15),
            headers: {'Accept': 'application/json'},
        ),
    );
    dio.interceptors.add(
        AuthInterceptor(retryDioFactory: () => dio),
    );
    dio.interceptors.add(ErrorInterceptor());
    if (kDebugMode) {
        dio.interceptors.add(
            LogInterceptor(
                requestBody: true,
                responseBody: false,
                requestHeader: false,
                responseHeader: false,
            ),
        );
    }
    return dio;
}

final apiClientProvider = Provider<Dio>((ref) {
    return buildApiClient(baseUrl: AppEnv.apiBaseUrl);
});
