// ErrorInterceptor가 HTTP 상태/Dio 예외를 도메인 예외로 매핑하는지 검증한다.

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:my_closet_mobile/core/network/api_exception.dart';
import 'package:my_closet_mobile/core/network/error_interceptor.dart';

class _CaptureHandler extends ErrorInterceptorHandler {
    DioException? rejected;
    DioException? nextErr;

    @override
    void reject(DioException error, [bool callFollowingErrorInterceptor = false]) {
        rejected = error;
    }

    @override
    void next(DioException err) {
        nextErr = err;
    }
}

DioException _err({
    required DioExceptionType type,
    Response<dynamic>? response,
}) {
    return DioException(
        requestOptions: RequestOptions(path: '/x'),
        type: type,
        response: response,
    );
}

void main() {
    final interceptor = ErrorInterceptor();

    test('connectionError는 NetworkException으로 매핑된다', () {
        final handler = _CaptureHandler();
        interceptor.onError(
            _err(type: DioExceptionType.connectionError),
            handler,
        );
        expect(handler.rejected?.error, isA<NetworkException>());
    });

    test('401은 UnauthorizedException으로 매핑된다', () {
        final handler = _CaptureHandler();
        final response = Response<dynamic>(
            requestOptions: RequestOptions(path: '/x'),
            statusCode: 401,
        );
        interceptor.onError(
            _err(type: DioExceptionType.badResponse, response: response),
            handler,
        );
        expect(handler.rejected?.error, isA<UnauthorizedException>());
    });

    test('500은 ApiException으로 매핑되고 페이로드에서 code를 추출한다', () {
        final handler = _CaptureHandler();
        final response = Response<dynamic>(
            requestOptions: RequestOptions(path: '/x'),
            statusCode: 500,
            data: {'message': 'boom', 'code': 'server_error'},
        );
        interceptor.onError(
            _err(type: DioExceptionType.badResponse, response: response),
            handler,
        );
        final err = handler.rejected?.error;
        expect(err, isA<ApiException>());
        final api = err as ApiException;
        expect(api.statusCode, 500);
        expect(api.code, 'server_error');
        expect(api.message, 'boom');
    });
}
