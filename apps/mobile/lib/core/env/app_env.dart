// 빌드 시 --dart-define으로 주입되는 환경 변수를 정적으로 노출한다.

class AppEnv {
    static const String apiBaseUrl = String.fromEnvironment('API_BASE_URL');
    static const String sentryDsn = String.fromEnvironment('SENTRY_DSN');

    static const String _environment = String.fromEnvironment(
        'APP_ENV',
        defaultValue: 'dev',
    );

    static bool get isDev => _environment == 'dev';
    static bool get isProd => _environment == 'prod';
    static String get environment => _environment;

    static List<String> validate() {
        final missing = <String>[];
        if (apiBaseUrl.isEmpty) missing.add('API_BASE_URL');
        if (isProd && sentryDsn.isEmpty) missing.add('SENTRY_DSN');
        return missing;
    }
}

class EnvConfigException implements Exception {
    EnvConfigException(this.missing);
    final List<String> missing;

    @override
    String toString() =>
        'EnvConfigException(missing: ${missing.join(', ')})';
}
