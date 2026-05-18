// AuthInterceptor가 Riverpod 의존성 그래프 없이 인증 상태에 접근하기 위한 전역 콜백 등록소.
// AuthController가 init 시 등록하고, AuthInterceptor가 onRequest/onError에서 호출한다.

class AuthCallbacks {
    String? Function()? getAccessToken;
    Future<String?> Function()? refreshAccessToken;
    void Function()? onUnauthorized;
}

final authCallbacks = AuthCallbacks();
