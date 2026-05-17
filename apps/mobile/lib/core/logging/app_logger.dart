// 앱 전역 Logger 인스턴스와 Riverpod 옵저버.

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';

final appLogger = Logger(
    printer: PrettyPrinter(methodCount: 0, colors: false, printEmojis: false),
    level: kDebugMode ? Level.debug : Level.warning,
);

class LoggingObserver extends ProviderObserver {
    @override
    void providerDidFail(
        ProviderBase<Object?> provider,
        Object error,
        StackTrace stackTrace,
        ProviderContainer container,
    ) {
        appLogger.e(
            'Provider failed: ${provider.name ?? provider.runtimeType}',
            error: error,
            stackTrace: stackTrace,
        );
    }
}
