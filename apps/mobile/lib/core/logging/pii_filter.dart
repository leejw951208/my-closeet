// Sentry/로그 페이로드에서 이메일·토큰 PII를 마스킹하는 헬퍼.

import 'package:sentry_flutter/sentry_flutter.dart';

final _emailPattern = RegExp(
    r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',
);
final _bearerPattern = RegExp(r'Bearer\s+[A-Za-z0-9._\-]+', caseSensitive: false);

String maskPii(String input) {
    return input
        .replaceAll(_emailPattern, '[redacted-email]')
        .replaceAll(_bearerPattern, 'Bearer [redacted]');
}

SentryEvent? filterSentryEvent(SentryEvent event, Hint hint) {
    final exception = event.throwable;
    if (exception != null) {
        final message = exception.toString();
        if (message.contains(' 401 ') ||
            message.contains(' 404 ') ||
            message.contains('statusCode: 401') ||
            message.contains('statusCode: 404')) {
            return null;
        }
    }

    final request = event.request;
    SentryRequest? scrubbedRequest = request;
    if (request != null) {
        final headers = Map<String, String>.from(request.headers)
            ..remove('Authorization')
            ..remove('authorization');
        scrubbedRequest = request.copyWith(headers: headers);
    }

    final user = event.user;
    SentryUser? scrubbedUser = user;
    if (user?.email != null) {
        scrubbedUser = user!.copyWith(email: '[redacted-email]');
    }

    return event.copyWith(
        request: scrubbedRequest,
        user: scrubbedUser,
    );
}
