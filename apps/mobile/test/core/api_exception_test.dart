// ApiException 계열 toString·필드 동작 테스트.

import 'package:flutter_test/flutter_test.dart';

import 'package:my_closet_mobile/core/network/api_exception.dart';

void main() {
    test('ApiException toString이 statusCode와 message를 포함한다', () {
        final e = ApiException(statusCode: 500, message: 'oops');
        expect(e.toString(), contains('500'));
        expect(e.toString(), contains('oops'));
    });

    test('UnauthorizedException은 401과 unauthorized 코드를 가진다', () {
        final e = UnauthorizedException();
        expect(e.statusCode, 401);
        expect(e.code, 'unauthorized');
    });

    test('NetworkException은 메시지를 보존한다', () {
        final e = NetworkException('offline');
        expect(e.toString(), contains('offline'));
    });
}
