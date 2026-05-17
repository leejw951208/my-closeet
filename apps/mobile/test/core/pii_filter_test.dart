// Sentry beforeSend (filterSentryEvent) PII 마스킹과 401/404 필터링 테스트.

import 'package:flutter_test/flutter_test.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'package:my_closet_mobile/core/logging/pii_filter.dart';

class _Status401 implements Exception {
    @override
    String toString() => 'DioException(statusCode: 401, message: x)';
}

class _Status500 implements Exception {
    @override
    String toString() => 'ApiException(statusCode: 500, message: boom)';
}

void main() {
    test('maskPii는 이메일과 Bearer 토큰을 마스킹한다', () {
        const raw = 'user a@b.co token Bearer abc.def';
        final out = maskPii(raw);
        expect(out.contains('a@b.co'), isFalse);
        expect(out.contains('[redacted-email]'), isTrue);
        expect(out.contains('Bearer [redacted]'), isTrue);
    });

    test('401 예외는 필터링되어 null 반환', () {
        final event = SentryEvent(throwable: _Status401());
        expect(filterSentryEvent(event, Hint()), isNull);
    });

    test('500 예외는 통과한다', () {
        final event = SentryEvent(throwable: _Status500());
        expect(filterSentryEvent(event, Hint()), isNotNull);
    });

    test('user.email은 마스킹된다', () {
        final event = SentryEvent(
            throwable: _Status500(),
            user: SentryUser(email: 'user@example.com'),
        );
        final filtered = filterSentryEvent(event, Hint());
        expect(filtered?.user?.email, '[redacted-email]');
    });

    test('Authorization 헤더는 제거된다', () {
        final event = SentryEvent(
            throwable: _Status500(),
            request: SentryRequest(
                headers: {'Authorization': 'Bearer xyz', 'Accept': 'json'},
            ),
        );
        final filtered = filterSentryEvent(event, Hint());
        final headers = filtered?.request?.headers ?? {};
        expect(headers.containsKey('Authorization'), isFalse);
        expect(headers['Accept'], 'json');
    });
}
