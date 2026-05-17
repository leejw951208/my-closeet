// 인증 상태 전이를 표현하는 enum과 Provider 인터페이스.

import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AuthStatus { unknown, signedIn, signedOut }

class AuthState {
    const AuthState({required this.status, this.userId, this.accessToken});

    final AuthStatus status;
    final String? userId;
    final String? accessToken;

    static const AuthState unknown = AuthState(status: AuthStatus.unknown);
    static const AuthState signedOut = AuthState(status: AuthStatus.signedOut);

    AuthState copyWith({
        AuthStatus? status,
        String? userId,
        String? accessToken,
    }) {
        return AuthState(
            status: status ?? this.status,
            userId: userId ?? this.userId,
            accessToken: accessToken ?? this.accessToken,
        );
    }
}

class AuthController extends StateNotifier<AuthState> {
    AuthController() : super(AuthState.signedOut);

    void signIn({required String userId, required String accessToken}) {
        state = AuthState(
            status: AuthStatus.signedIn,
            userId: userId,
            accessToken: accessToken,
        );
    }

    void signOut() {
        state = AuthState.signedOut;
    }

    Future<String?> refreshToken() async {
        // auth-login 슬러그에서 Supabase 갱신 로직으로 대체된다.
        return null;
    }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
        return AuthController();
    });
