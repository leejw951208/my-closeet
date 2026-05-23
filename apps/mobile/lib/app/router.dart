// go_router 기반 라우트 트리와 인증 상태 기반 리다이렉트.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/auth_state.dart';
import '../features/auth/data/auth_prefs.dart';
import '../features/auth/presentation/onboarding_consent_screen.dart';
import '../features/auth/presentation/otp_input_screen.dart';
import '../features/auth/presentation/phone_change_screen.dart';
import '../features/auth/presentation/phone_input_screen.dart';
import '../features/auth/presentation/pin_login_screen.dart';
import '../features/auth/presentation/pin_reset_screen.dart';
import '../features/auth/presentation/pin_setup_screen.dart';

enum AppRoute {
    pinLogin('/auth/pin-login'),
    phone('/auth/phone'),
    otp('/auth/otp'),
    onboardingConsent('/auth/onboarding-consent'),
    pinSetup('/auth/pin-setup'),
    pinReset('/auth/pin-reset'),
    phoneChange('/settings/phone-change'),
    home('/'),
    closet('/closet'),
    outfit('/outfit'),
    calendar('/calendar');

    const AppRoute(this.path);
    final String path;
    String get name => toString().split('.').last;
}

final routerProvider = Provider<GoRouter>((ref) {
    final refresh = _AuthRefreshNotifier(ref);
    ref.onDispose(refresh.dispose);
    // 부팅 시 한 번 토큰 복원 시도.
    Future.microtask(() => ref.read(authControllerProvider.notifier).restore());
    return GoRouter(
        initialLocation: AppRoute.home.path,
        refreshListenable: refresh,
        redirect: (context, state) {
            final auth = ref.read(authControllerProvider);
            final loc = state.matchedLocation;
            final isAuthRoute = loc.startsWith('/auth/');
            if (auth.status == AuthStatus.unknown) return null;
            if (auth.status == AuthStatus.signedOut && !isAuthRoute) {
                return auth.lastKnownPhoneNumber != null
                    ? AppRoute.pinLogin.path
                    : AppRoute.onboardingConsent.path;
            }
            if (auth.status == AuthStatus.authenticated && isAuthRoute) {
                return AppRoute.home.path;
            }
            return null;
        },
        routes: [
            GoRoute(
                path: AppRoute.pinLogin.path,
                builder: (_, __) => const PinLoginScreen(),
            ),
            GoRoute(
                path: AppRoute.phone.path,
                builder: (_, __) => const PhoneInputScreen(),
            ),
            GoRoute(
                path: AppRoute.otp.path,
                builder: (_, state) {
                    final purpose = state.uri.queryParameters['purpose'] ?? 'SIGNUP';
                    return OtpInputScreen(purpose: purpose);
                },
            ),
            GoRoute(
                path: AppRoute.onboardingConsent.path,
                builder: (_, __) => const OnboardingConsentScreen(),
            ),
            GoRoute(
                path: AppRoute.pinSetup.path,
                builder: (_, state) {
                    final mode = state.uri.queryParameters['mode'] ?? 'signup';
                    return PinSetupScreen(mode: mode);
                },
            ),
            GoRoute(
                path: AppRoute.pinReset.path,
                builder: (_, __) => const PinResetScreen(),
            ),
            GoRoute(
                path: AppRoute.phoneChange.path,
                builder: (_, __) => const PhoneChangeScreen(),
            ),
            GoRoute(
                path: AppRoute.home.path,
                name: AppRoute.home.name,
                builder: (context, state) => const _HomePlaceholder(),
            ),
            for (final route in [AppRoute.closet, AppRoute.outfit, AppRoute.calendar])
                GoRoute(
                    path: route.path,
                    name: route.name,
                    builder: (context, state) => PlaceholderScreen(route: route),
                ),
        ],
    );
});

class _AuthRefreshNotifier extends ChangeNotifier {
    _AuthRefreshNotifier(this._ref) {
        _sub = _ref.listen<AuthState>(authControllerProvider, (_, __) {
            notifyListeners();
        });
    }

    final Ref _ref;
    late final ProviderSubscription<AuthState> _sub;

    @override
    void dispose() {
        _sub.close();
        super.dispose();
    }
}

class _HomePlaceholder extends ConsumerStatefulWidget {
    const _HomePlaceholder();

    @override
    ConsumerState<_HomePlaceholder> createState() => _HomePlaceholderState();
}

class _HomePlaceholderState extends ConsumerState<_HomePlaceholder> {
    bool _bannerEvaluated = false;
    bool _showBanner = false;

    @override
    void initState() {
        super.initState();
        WidgetsBinding.instance.addPostFrameCallback((_) => _evaluateBanner());
    }

    Future<void> _evaluateBanner() async {
        final auth = ref.read(authControllerProvider);
        final last = auth.lastSignInAt;
        if (last == null) {
            setState(() => _bannerEvaluated = true);
            return;
        }
        final stale = DateTime.now().difference(last).inDays >= 30;
        if (!stale) {
            setState(() => _bannerEvaluated = true);
            return;
        }
        final prefs = ref.read(authPrefsProvider);
        final dismissed = await prefs.readBannerDismissedDate();
        final today = DateTime.now().toIso8601String().substring(0, 10);
        if (mounted) {
            setState(() {
                _showBanner = dismissed != today;
                _bannerEvaluated = true;
            });
        }
    }

    Future<void> _dismissBanner() async {
        await ref.read(authPrefsProvider).markBannerDismissedToday();
        if (mounted) setState(() => _showBanner = false);
    }

    @override
    Widget build(BuildContext context) {
        return Scaffold(
            appBar: AppBar(
                title: const Text('My Closet'),
                actions: [
                    IconButton(
                        icon: const Icon(Icons.logout),
                        onPressed: () =>
                            ref.read(authControllerProvider.notifier).signOut(),
                    ),
                    IconButton(
                        icon: const Icon(Icons.phone_android),
                        onPressed: () => context.push('/settings/phone-change'),
                    ),
                ],
            ),
            body: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                    if (_bannerEvaluated && _showBanner)
                        MaterialBanner(
                            content: const Text(
                                '오랜만이네요. 휴대폰 번호가 바뀌셨다면 설정에서 먼저 변경해주세요. '
                                '안 하면 데이터 복구가 어려워요.',
                            ),
                            actions: [
                                TextButton(
                                    onPressed: _dismissBanner,
                                    child: const Text('알겠어요'),
                                ),
                            ],
                        ),
                    Expanded(
                        child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                    Icon(
                                        Icons.checkroom,
                                        size: 48,
                                        color: Theme.of(context).colorScheme.primary,
                                    ),
                                    const SizedBox(height: 18),
                                    Text(
                                        '로그인이 완료됐어요',
                                        textAlign: TextAlign.center,
                                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                            fontWeight: FontWeight.w800,
                                        ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                        '이제 내 옷장을 채울 준비가 됐습니다.',
                                        textAlign: TextAlign.center,
                                        style: Theme.of(context).textTheme.bodyMedium,
                                    ),
                                    const SizedBox(height: 28),
                                    FilledButton(
                                        onPressed: () => context.push('/closet'),
                                        child: const Text('옷장 확인하기'),
                                    ),
                                    const SizedBox(height: 8),
                                    TextButton(
                                        onPressed: () => context.push('/settings/phone-change'),
                                        child: const Text('휴대폰 번호 변경'),
                                    ),
                                ],
                            ),
                        ),
                    ),
                ],
            ),
        );
    }
}

class PlaceholderScreen extends StatelessWidget {
    const PlaceholderScreen({super.key, required this.route});

    final AppRoute route;

    @override
    Widget build(BuildContext context) {
        return Scaffold(
            appBar: AppBar(title: Text(route.name)),
            body: Center(
                child: Text(
                    '${route.name} placeholder',
                    style: Theme.of(context).textTheme.titleLarge,
                ),
            ),
        );
    }
}
