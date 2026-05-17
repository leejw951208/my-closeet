// HTTP 상태/예외를 도메인 ApiException으로 매핑하는 Dio 인터셉터.

import 'package:dio/dio.dart';

import 'api_exception.dart';

class ErrorInterceptor extends Interceptor {
    @override
    void onError(DioException err, ErrorInterceptorHandler handler) {
        final status = err.response?.statusCode;
        if (err.type == DioExceptionType.connectionError ||
            err.type == DioExceptionType.connectionTimeout ||
            err.type == DioExceptionType.receiveTimeout ||
            err.type == DioExceptionType.sendTimeout) {
            handler.reject(
                _wrap(err, NetworkException(err.message ?? 'network error')),
            );
            return;
        }
        if (status == 401) {
            handler.reject(_wrap(err, UnauthorizedException()));
            return;
        }
        if (status != null) {
            handler.reject(
                _wrap(
                    err,
                    ApiException(
                        statusCode: status,
                        message: _extractMessage(err.response?.data) ??
                            err.message ??
                            'request failed',
                        code: _extractCode(err.response?.data),
                    ),
                ),
            );
            return;
        }
        handler.next(err);
    }

    DioException _wrap(DioException err, Object error) {
        return DioException(
            requestOptions: err.requestOptions,
            response: err.response,
            type: err.type,
            error: error,
            stackTrace: err.stackTrace,
        );
    }

    String? _extractMessage(Object? data) {
        if (data is Map && data['message'] is String) {
            return data['message'] as String;
        }
        return null;
    }

    String? _extractCode(Object? data) {
        if (data is Map && data['code'] is String) {
            return data['code'] as String;
        }
        return null;
    }
}
