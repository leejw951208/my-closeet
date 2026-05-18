// 인증 컨트롤러용 DTO. class-validator 데코레이터로 입력 검증을 수행한다.

import { IsIn, IsString, Matches } from "class-validator"

export class SendOtpDto {
    @Matches(/^\+82\d{9,10}$/)
    phoneNumber!: string

    @IsString()
    @IsIn(["SIGNUP", "RESET", "PHONE_CHANGE"])
    purpose!: "SIGNUP" | "RESET" | "PHONE_CHANGE"
}

export class VerifyOtpDto {
    @IsString()
    requestId!: string

    @Matches(/^\d{6}$/)
    code!: string

    @IsString()
    @IsIn(["SIGNUP", "RESET", "PHONE_CHANGE"])
    purpose!: "SIGNUP" | "RESET" | "PHONE_CHANGE"
}

export class SignupCompleteDto {
    @IsString()
    otpSessionToken!: string

    @Matches(/^\d{6}$/)
    pin!: string

    @IsString()
    deviceId!: string
}

export class PinLoginDto {
    @Matches(/^\+82\d{9,10}$/)
    phoneNumber!: string

    @Matches(/^\d{6}$/)
    pin!: string

    @IsString()
    deviceId!: string
}

export class PinResetDto {
    @IsString()
    otpSessionToken!: string

    @Matches(/^\d{6}$/)
    newPin!: string

    @IsString()
    deviceId!: string
}

export class RefreshDto {
    @IsString()
    refreshToken!: string
}

export class PhoneChangeDto {
    @IsString()
    currentOtpSessionToken!: string

    @IsString()
    newOtpSessionToken!: string
}

export class LogoutDto {
    @IsString()
    refreshToken!: string
}
