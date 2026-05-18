// 인증 상태 모델과 컨트롤러. SMS+PIN+생체인식 흐름의 토큰·디바이스 식별자를 관리한다.

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/auth_callbacks.dart';
import '../../core/storage/secure_token_storage.dart';
import 'data/auth_api.dart';
import 'data/auth_prefs.dart';
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
        this.lastKnownPhoneNumber,
    });

    final AuthStatus status;
    final String? userId;
    final String? phoneNumber;
    final String? accessToken;
    final DateTime? lastSignInAt;
    /// 마지막으로 로그인했던 휴대폰 번호(E.164). signedOut 상태에서도 유지되어 PIN 로그인 화면에서 사용한다.
    final String? lastKnownPhoneNumber;

    static const AuthState unknown = AuthState(status: AuthStatus.unknown);
    static const AuthState signedOut = AuthState(status: AuthStatus.signedOut);

    AuthState copyWith({
        AuthStatus? status,
        String? userId,
        String? phoneNumber,
        String? accessToken,
        DateTime? lastSignInAt,
        String? lastKnownPhoneNumber,
    }) {
        return AuthState(
            status: status ?? this.status,
            userId: userId ?? this.userId,
            phoneNumber: phoneNumber ?? this.phoneNumber,
            accessToken: accessToken ?? this.accessToken,
            lastSignInAt: lastSignInAt ?? this.lastSignInAt,
            lastKnownPhoneNumber: lastKnownPhoneNumber ?? this.lastKnownPhoneNumber,
        );
    }
}

class AuthController extends StateNotifier<AuthState> {
    AuthController({
        required AuthRepository repository,
        required SecureTokenStorage storage,
        required AuthPrefs prefs,
    })  : _repository = repository,
          _storage = storage,
          _prefs = prefs,
          super(AuthState.unknown) {
        authCallbacks.getAccessToken = () => state.accessToken;
        authCallbacks.refreshAccessToken = refreshToken;
        authCallbacks.onUnauthorized = () {
            // ignore: discarded_futures
            signOut();
        };
    }

    @override
    void dispose() {
        authCallbacks.getAccessToken = null;
        authCallbacks.refreshAccessToken = null;
        authCallbacks.onUnauthorized = null;
        super.dispose();
    }

    final AuthRepository _repository;
    final SecureTokenStorage _storage;
    final AuthPrefs _prefs;

    Future<void> restore() async {
        final lastPhone = await _prefs.readLastPhoneNumber();
        final refresh = await _storage.readRefreshToken();
        if (refresh == null || refresh.isEmpty) {
            state = AuthState.signedOut.copyWith(lastKnownPhoneNumber: lastPhone);
            return;
        }
        try {
            final pair = await _repository.refresh(refresh);
            await _storage.write(
                accessToken: pair.accessToken,
                refreshToken: pair.refreshToken,
            );
            final me = await _repository.me(pair.accessToken);
            await _prefs.writeLastPhoneNumber(me.phoneNumber);
            state = AuthState(
                status: AuthStatus.authenticated,
                userId: me.id,
                phoneNumber: me.phoneNumber,
                accessToken: pair.accessToken,
                lastSignInAt: me.lastSignInAt,
                lastKnownPhoneNumber: me.phoneNumber,
            );
        } catch (_) {
            await _storage.clear();
            state = AuthState.signedOut.copyWith(lastKnownPhoneNumber: lastPhone);
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
        await _prefs.writeLastPhoneNumber(phoneNumber);
        state = AuthState(
            status: AuthStatus.authenticated,
            userId: userId,
            phoneNumber: phoneNumber,
            accessToken: tokens.accessToken,
            lastSignInAt: lastSignInAt,
            lastKnownPhoneNumber: phoneNumber,
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
        // lastKnownPhoneNumber 는 의도적으로 유지 — 다음 PIN 로그인 화면에서 사용.
        state = AuthState.signedOut.copyWith(
            lastKnownPhoneNumber: state.lastKnownPhoneNumber,
        );
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
            prefs: ref.watch(authPrefsProvider),
        );
    });
