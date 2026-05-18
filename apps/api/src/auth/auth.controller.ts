// 인증 라우트. OTP·가입·로그인·재설정·refresh·번호변경·로그아웃·me 9개 엔드포인트.

import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
} from "@nestjs/common"
import { Throttle } from "@nestjs/throttler"
import { AuthService } from "./auth.service"
import { CurrentUser } from "./current-user.decorator"
import { Public } from "./public.decorator"
import { AuthenticatedUser } from "./auth.types"
import {
    LogoutDto,
    PhoneChangeDto,
    PinLoginDto,
    PinResetDto,
    RefreshDto,
    SendOtpDto,
    SignupCompleteDto,
    VerifyOtpDto,
} from "./dto/auth.dto"

@Controller("auth")
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Public()
    @Throttle({ "otp-send": { limit: 5, ttl: 60_000 } })
    @Post("otp/send")
    @HttpCode(HttpStatus.OK)
    sendOtp(@Body() dto: SendOtpDto) {
        return this.auth.requestOtp(dto.phoneNumber, dto.purpose)
    }

    @Public()
    @Post("otp/verify")
    @HttpCode(HttpStatus.OK)
    verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.auth.verifyOtp(dto.requestId, dto.code, dto.purpose)
    }

    @Public()
    @Post("signup/complete")
    @HttpCode(HttpStatus.OK)
    signup(@Body() dto: SignupCompleteDto) {
        return this.auth.signupComplete(dto.otpSessionToken, dto.pin, dto.deviceId)
    }

    @Public()
    @Post("pin/verify")
    @HttpCode(HttpStatus.OK)
    pinLogin(@Body() dto: PinLoginDto) {
        return this.auth.pinLogin(dto.phoneNumber, dto.pin, dto.deviceId)
    }

    @Public()
    @Post("pin/reset")
    @HttpCode(HttpStatus.OK)
    pinReset(@Body() dto: PinResetDto) {
        return this.auth.pinReset(dto.otpSessionToken, dto.newPin, dto.deviceId)
    }

    @Public()
    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    refresh(@Body() dto: RefreshDto) {
        return this.auth.refresh(dto.refreshToken)
    }

    @Post("phone/change")
    @HttpCode(HttpStatus.OK)
    changePhone(@Body() dto: PhoneChangeDto) {
        return this.auth.changePhone(dto.currentOtpSessionToken, dto.newOtpSessionToken)
    }

    @Post("logout")
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: LogoutDto,
    ): Promise<void> {
        await this.auth.logout(user.id, dto.refreshToken)
    }

    @Get("me")
    me(@CurrentUser() user: AuthenticatedUser) {
        return this.auth.getMe(user.id)
    }
}
