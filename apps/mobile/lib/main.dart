// My Closet 모바일 앱 진입점. 환경 검증, Sentry 초기화, ProviderScope 마운트를 수행한다.

import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'app/app.dart';
import 'app/env_error_app.dart';
import 'core/env/app_env.dart';
import 'core/logging/app_logger.dart';
import 'core/logging/pii_filter.dart';

Future<void> main() async {
    await runZonedGuarded<Future<void>>(() async {
        WidgetsFlutterBinding.ensureInitialized();

        final missing = AppEnv.validate();
        if (missing.isNotEmpty) {
            runApp(EnvErrorApp(missing: missing));
            return;
        }

        FlutterError.onError = (details) {
            FlutterError.presentError(details);
            unawaited(
                Sentry.captureException(
                    details.exception,
                    stackTrace: details.stack,
                ),
            );
        };

        Widget appRoot() => ProviderScope(
            observers: [if (kDebugMode) LoggingObserver()],
            child: const MyClosetApp(),
        );

        if (AppEnv.sentryDsn.isNotEmpty) {
            await SentryFlutter.init(
                (options) {
                    options.dsn = AppEnv.sentryDsn;
                    options.environment = AppEnv.environment;
                    options.tracesSampleRate = 0.1;
                    options.beforeSend = filterSentryEvent;
                },
                appRunner: () => runApp(appRoot()),
            );
        } else {
            runApp(appRoot());
        }
    }, (error, stack) {
        appLogger.e('Unhandled zone error', error: error, stackTrace: stack);
        unawaited(Sentry.captureException(error, stackTrace: stack));
    });
}
