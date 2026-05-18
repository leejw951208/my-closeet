// JWT 부착과 401 자동 갱신(single-flight)을 담당하는 Dio 인터셉터.

import 'dart:async';

import 'package:dio/dio.dart';

import 'auth_callbacks.dart';

typedef DioFactory = Dio Function();

class AuthInterceptor extends Interceptor {
    AuthInterceptor({required DioFactory retryDioFactory})
        : _retryDioFactory = retryDioFactory;

    final DioFactory _retryDioFactory;
    Future<String?>? _inflightRefresh;

    @override
    void onRequest(
        RequestOptions options,
        RequestInterceptorHandler handler,
    ) {
        if (options.headers['Authorization'] == null) {
            final token = authCallbacks.getAccessToken?.call();
            if (token != null && token.isNotEmpty) {
                options.headers['Authorization'] = 'Bearer $token';
            }
        }
        handler.next(options);
    }

    @override
    Future<void> onError(
        DioException err,
        ErrorInterceptorHandler handler,
    ) async {
        final response = err.response;
        final alreadyRetried = err.requestOptions.extra['_retried'] == true;
        if (response?.statusCode != 401 || alreadyRetried) {
            handler.next(err);
            return;
        }

        final newToken = await _refreshOnce();
        if (newToken == null) {
            authCallbacks.onUnauthorized?.call();
            handler.next(err);
            return;
        }

        final options = err.requestOptions
            ..headers['Authorization'] = 'Bearer $newToken'
            ..extra['_retried'] = true;
        try {
            final retried = await _retryDioFactory().fetch<dynamic>(options);
            handler.resolve(retried);
        } on DioException catch (retryErr) {
            handler.next(retryErr);
        }
    }

    Future<String?> _refreshOnce() {
        final refresher = authCallbacks.refreshAccessToken;
        if (refresher == null) return Future.value(null);
        return _inflightRefresh ??= refresher().whenComplete(() {
            _inflightRefresh = null;
        });
    }
}
