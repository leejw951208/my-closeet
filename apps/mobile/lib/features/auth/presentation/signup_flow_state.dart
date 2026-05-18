// 가입 흐름 동안 OTP 세션 토큰·전화번호·진행 단계를 임시 보관하는 Riverpod 상태.

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

@immutable
class SignupFlowState {
    const SignupFlowState({
        this.phoneNumber,
        this.requestId,
        this.otpSessionToken,
        this.isNewUser,
        this.consented = false,
        this.devCode,
    });

    final String? phoneNumber;
    final String? requestId;
    final String? otpSessionToken;
    final bool? isNewUser;
    final bool consented;
    /// dev 모드일 때 백엔드가 내려준 OTP 코드. OTP 화면에서 자동 채움에 사용한다.
    final String? devCode;

    SignupFlowState copyWith({
        String? phoneNumber,
        String? requestId,
        String? otpSessionToken,
        bool? isNewUser,
        bool? consented,
        String? devCode,
    }) {
        return SignupFlowState(
            phoneNumber: phoneNumber ?? this.phoneNumber,
            requestId: requestId ?? this.requestId,
            otpSessionToken: otpSessionToken ?? this.otpSessionToken,
            isNewUser: isNewUser ?? this.isNewUser,
            consented: consented ?? this.consented,
            devCode: devCode ?? this.devCode,
        );
    }
}

class SignupFlowController extends StateNotifier<SignupFlowState> {
    SignupFlowController() : super(const SignupFlowState());

    void startOtp({
        required String phoneNumber,
        required String requestId,
        String? devCode,
    }) {
        state = SignupFlowState(
            phoneNumber: phoneNumber,
            requestId: requestId,
            devCode: devCode,
        );
    }

    void otpVerified({required String otpSessionToken, required bool isNewUser}) {
        state = state.copyWith(
            otpSessionToken: otpSessionToken,
            isNewUser: isNewUser,
        );
    }

    void setConsent(bool value) {
        state = state.copyWith(consented: value);
    }

    void reset() {
        state = const SignupFlowState();
    }
}

final signupFlowStateProvider =
    StateNotifierProvider<SignupFlowController, SignupFlowState>((ref) {
        return SignupFlowController();
    });
