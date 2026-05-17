// go_router 기반 라우트 트리와 인증 리다이렉트.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/auth_state.dart';

enum AppRoute {
    login('/login'),
    home('/'),
    register('/register'),
    closet('/closet'),
    outfit('/outfit'),
    calendar('/calendar');

    const AppRoute(this.path);
    final String path;
    String get name => toString().split('.').last;
}

final routerProvider = Provider<GoRouter>((ref) {
    return GoRouter(
        initialLocation: AppRoute.home.path,
        redirect: (context, state) {
            final auth = ref.read(authControllerProvider);
            final goingToLogin = state.matchedLocation == AppRoute.login.path;
            if (auth.status == AuthStatus.signedOut && !goingToLogin) {
                return AppRoute.login.path;
            }
            if (auth.status == AuthStatus.signedIn && goingToLogin) {
                return AppRoute.home.path;
            }
            return null;
        },
        routes: [
            for (final route in AppRoute.values)
                GoRoute(
                    path: route.path,
                    name: route.name,
                    builder: (context, state) =>
                        _PlaceholderScreen(route: route),
                ),
        ],
    );
});

class _PlaceholderScreen extends StatelessWidget {
    const _PlaceholderScreen({required this.route});

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
