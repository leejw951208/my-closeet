// AuthGuard가 부착하는 요청 사용자 컨텍스트 타입과 OTP 세션 토큰 페이로드.

export interface AuthenticatedUser {
    id: string
    phoneNumber: string
}

export interface AuthenticatedRequest {
    user: AuthenticatedUser
}

export type OtpPurpose = "SIGNUP" | "RESET" | "PHONE_CHANGE"

export interface OtpSessionPayload {
    phoneNumber: string
    purpose: OtpPurpose
    userId?: string
    // OtpRequest.id. 세션 소비 추적용. 발급 시 부여, 검증 시 DB로 1회용 보장.
    jti?: string
}

export interface AccessTokenPayload {
    sub: string
    phoneNumber: string
}

export interface TokenPair {
    accessToken: string
    refreshToken: string
}
