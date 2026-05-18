// 인증 상태 모델과 컨트롤러. SMS+PIN+생체인식 흐름의 토큰·디바이스 식별자를 관리한다.

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/storage/secure_token_storage.dart';
import 'data/auth_api.dart';
import 'data/auth_repository.dart';

enum AuthStatus {
    unknown,
    signedOut,
    otpPending,
    pinSetupPending,
    authenticated,
    locked,
}

@immutable
class AuthState {
    const AuthState({
        required this.status,
        this.userId,
        this.phoneNumber,
        this.accessToken,
        this.lastSignInAt,
    });

    final AuthStatus status;
    final String? userId;
    final String? phoneNumber;
    final String? accessToken;
    final DateTime? lastSignInAt;

    static const AuthState unknown = AuthState(status: AuthStatus.unknown);
    static const AuthState signedOut = AuthState(status: AuthStatus.signedOut);

    AuthState copyWith({
        AuthStatus? status,
        String? userId,
        String? phoneNumber,
        String? accessToken,
        DateTime? lastSignInAt,
    }) {
        return AuthState(
            status: status ?? this.status,
            userId: userId ?? this.userId,
            phoneNumber: phoneNumber ?? this.phoneNumber,
            accessToken: accessToken ?? this.accessToken,
            lastSignInAt: lastSignInAt ?? this.lastSignInAt,
        );
    }
}

class AuthController extends StateNotifier<AuthState> {
    AuthController({
        required AuthRepository repository,
        required SecureTokenStorage storage,
    })  : _repository = repository,
          _storage = storage,
          super(AuthState.unknown);

    final AuthRepository _repository;
    final SecureTokenStorage _storage;

    Future<void> restore() async {
        final refresh = await _storage.readRefreshToken();
        if (refresh == null || refresh.isEmpty) {
            state = AuthState.signedOut;
            return;
        }
        try {
            final pair = await _repository.refresh(refresh);
            await _storage.write(
                accessToken: pair.accessToken,
                refreshToken: pair.refreshToken,
            );
            final me = await _repository.me(pair.accessToken);
            state = AuthState(
                status: AuthStatus.authenticated,
                userId: me.id,
                phoneNumber: me.phoneNumber,
                accessToken: pair.accessToken,
                lastSignInAt: me.lastSignInAt,
            );
        } catch (_) {
            await _storage.clear();
            state = AuthState.signedOut;
        }
    }

    Future<void> setSession({
        required String userId,
        required String phoneNumber,
        required TokenPair tokens,
        DateTime? lastSignInAt,
    }) async {
        await _storage.write(
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        );
        state = AuthState(
            status: AuthStatus.authenticated,
            userId: userId,
            phoneNumber: phoneNumber,
            accessToken: tokens.accessToken,
            lastSignInAt: lastSignInAt,
        );
    }

    Future<void> signOut() async {
        final refresh = await _storage.readRefreshToken();
        if (refresh != null && refresh.isNotEmpty) {
            try {
                await _repository.logout(refresh);
            } catch (_) {}
        }
        await _storage.clear();
        state = AuthState.signedOut;
    }

    Future<String?> refreshToken() async {
        final refresh = await _storage.readRefreshToken();
        if (refresh == null || refresh.isEmpty) return null;
        try {
            final pair = await _repository.refresh(refresh);
            await _storage.write(
                accessToken: pair.accessToken,
                refreshToken: pair.refreshToken,
            );
            state = state.copyWith(accessToken: pair.accessToken);
            return pair.accessToken;
        } catch (_) {
            await _storage.clear();
            state = AuthState.signedOut;
            return null;
        }
    }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
        return AuthController(
            repository: ref.watch(authRepositoryProvider),
            storage: ref.watch(secureTokenStorageProvider),
        );
    });
