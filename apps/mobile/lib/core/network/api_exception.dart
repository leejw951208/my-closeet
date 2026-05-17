// 네트워크 계층에서 발생하는 예외의 도메인 타입 정의.

class ApiException implements Exception {
    ApiException({
        required this.statusCode,
        required this.message,
        this.code,
    });

    final int statusCode;
    final String message;
    final String? code;

    @override
    String toString() =>
        'ApiException(statusCode: $statusCode, code: $code, message: $message)';
}

class UnauthorizedException extends ApiException {
    UnauthorizedException({super.message = 'Unauthorized'})
        : super(statusCode: 401, code: 'unauthorized');
}

class NetworkException implements Exception {
    NetworkException(this.message);
    final String message;

    @override
    String toString() => 'NetworkException($message)';
}
