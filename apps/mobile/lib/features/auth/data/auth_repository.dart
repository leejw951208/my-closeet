// AuthApi 호출과 SecureStorage 저장을 묶는 리포지토리. 컨트롤러는 이 레이어를 통해서만 백엔드와 통신한다.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'auth_api.dart';

class AuthRepository {
    AuthRepository(this._api);
    final AuthApi _api;

    Future<OtpRequestResult> sendOtp(String phoneNumber, String purpose) =>
        _api.sendOtp(phoneNumber: phoneNumber, purpose: purpose);

    Future<OtpVerifyResult> verifyOtp({
        required String requestId,
        required String code,
        required String purpose,
    }) =>
        _api.verifyOtp(requestId: requestId, code: code, purpose: purpose);

    Future<SignupResult> signupComplete({
        required String otpSessionToken,
        required String pin,
        required String deviceId,
    }) =>
        _api.signupComplete(
            otpSessionToken: otpSessionToken,
            pin: pin,
            deviceId: deviceId,
        );

    Future<TokenPair> pinLogin({
        required String phoneNumber,
        required String pin,
        required String deviceId,
    }) =>
        _api.pinLogin(phoneNumber: phoneNumber, pin: pin, deviceId: deviceId);

    Future<TokenPair> pinReset({
        required String otpSessionToken,
        required String newPin,
        required String deviceId,
    }) =>
        _api.pinReset(
            otpSessionToken: otpSessionToken,
            newPin: newPin,
            deviceId: deviceId,
        );

    Future<TokenPair> refresh(String refreshToken) => _api.refresh(refreshToken);

    Future<UserMe> me([String? bearer]) => _api.me(bearer);

    Future<UserMe> changePhone({
        required String currentOtpSessionToken,
        required String newOtpSessionToken,
    }) =>
        _api.changePhone(
            currentOtpSessionToken: currentOtpSessionToken,
            newOtpSessionToken: newOtpSessionToken,
        );

    Future<void> logout(String refreshToken) => _api.logout(refreshToken);
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
    return AuthRepository(ref.watch(authApiProvider));
});
