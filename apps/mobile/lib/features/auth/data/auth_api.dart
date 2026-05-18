// 백엔드 /auth 엔드포인트 9개를 호출하는 Dio 클라이언트.

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';

class TokenPair {
    const TokenPair({required this.accessToken, required this.refreshToken});
    final String accessToken;
    final String refreshToken;

    factory TokenPair.fromJson(Map<String, dynamic> json) => TokenPair(
            accessToken: json['accessToken'] as String,
            refreshToken: json['refreshToken'] as String,
        );
}

class OtpRequestResult {
    const OtpRequestResult({
        required this.requestId,
        required this.expiresInSec,
        this.devCode,
    });
    final String requestId;
    final int expiresInSec;
    /// dev 모드(백엔드 SMS_DEV_MODE=true)에서만 채워진다. 운영에서는 null.
    final String? devCode;

    factory OtpRequestResult.fromJson(Map<String, dynamic> json) =>
        OtpRequestResult(
            requestId: json['requestId'] as String,
            expiresInSec: json['expiresInSec'] as int,
            devCode: json['devCode'] as String?,
        );
}

class OtpVerifyResult {
    const OtpVerifyResult({
        required this.otpSessionToken,
        required this.isNewUser,
    });
    final String otpSessionToken;
    final bool isNewUser;

    factory OtpVerifyResult.fromJson(Map<String, dynamic> json) =>
        OtpVerifyResult(
            otpSessionToken: json['otpSessionToken'] as String,
            isNewUser: json['isNewUser'] as bool,
        );
}

class SignupResult {
    const SignupResult({required this.tokens, required this.user});
    final TokenPair tokens;
    final UserMe user;
}

class UserMe {
    const UserMe({
        required this.id,
        required this.phoneNumber,
        this.lastSignInAt,
    });
    final String id;
    final String phoneNumber;
    final DateTime? lastSignInAt;

    factory UserMe.fromJson(Map<String, dynamic> json) => UserMe(
            id: json['id'] as String,
            phoneNumber: json['phoneNumber'] as String,
            lastSignInAt: json['lastSignInAt'] != null
                ? DateTime.parse(json['lastSignInAt'] as String)
                : null,
        );
}

class AuthApi {
    AuthApi(this._dio);
    final Dio _dio;

    Future<OtpRequestResult> sendOtp({
        required String phoneNumber,
        required String purpose,
    }) async {
        final res = await _dio.post<Map<String, dynamic>>(
            '/auth/otp/send',
            data: {'phoneNumber': phoneNumber, 'purpose': purpose},
        );
        return OtpRequestResult.fromJson(res.data!);
    }

    Future<OtpVerifyResult> verifyOtp({
        required String requestId,
        required String code,
        required String purpose,
    }) async {
        final res = await _dio.post<Map<String, dynamic>>(
            '/auth/otp/verify',
            data: {'requestId': requestId, 'code': code, 'purpose': purpose},
        );
        return OtpVerifyResult.fromJson(res.data!);
    }

    Future<SignupResult> signupComplete({
        required String otpSessionToken,
        required String pin,
        required String deviceId,
    }) async {
        final res = await _dio.post<Map<String, dynamic>>(
            '/auth/signup/complete',
            data: {
                'otpSessionToken': otpSessionToken,
                'pin': pin,
                'deviceId': deviceId,
            },
        );
        return SignupResult(
            tokens: TokenPair.fromJson(res.data!),
            user: UserMe.fromJson(res.data!['user'] as Map<String, dynamic>),
        );
    }

    Future<TokenPair> pinLogin({
        required String phoneNumber,
        required String pin,
        required String deviceId,
    }) async {
        final res = await _dio.post<Map<String, dynamic>>(
            '/auth/pin/verify',
            data: {'phoneNumber': phoneNumber, 'pin': pin, 'deviceId': deviceId},
        );
        return TokenPair.fromJson(res.data!);
    }

    Future<TokenPair> pinReset({
        required String otpSessionToken,
        required String newPin,
        required String deviceId,
    }) async {
        final res = await _dio.post<Map<String, dynamic>>(
            '/auth/pin/reset',
            data: {
                'otpSessionToken': otpSessionToken,
                'newPin': newPin,
                'deviceId': deviceId,
            },
        );
        return TokenPair.fromJson(res.data!);
    }

    Future<TokenPair> refresh(String refreshToken) async {
        final res = await _dio.post<Map<String, dynamic>>(
            '/auth/refresh',
            data: {'refreshToken': refreshToken},
        );
        return TokenPair.fromJson(res.data!);
    }

    Future<UserMe> me([String? bearer]) async {
        final res = await _dio.get<Map<String, dynamic>>(
            '/auth/me',
            options: bearer != null
                ? Options(headers: {'Authorization': 'Bearer $bearer'})
                : null,
        );
        return UserMe.fromJson(res.data!);
    }

    Future<UserMe> changePhone({
        required String currentOtpSessionToken,
        required String newOtpSessionToken,
    }) async {
        final res = await _dio.post<Map<String, dynamic>>(
            '/auth/phone/change',
            data: {
                'currentOtpSessionToken': currentOtpSessionToken,
                'newOtpSessionToken': newOtpSessionToken,
            },
        );
        return UserMe.fromJson(res.data!);
    }

    Future<void> logout(String refreshToken) async {
        await _dio.post<void>('/auth/logout', data: {'refreshToken': refreshToken});
    }
}

final authApiProvider = Provider<AuthApi>((ref) {
    return AuthApi(ref.watch(apiClientProvider));
});
