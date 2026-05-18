// Auth 모듈. OTP·PIN·JWT·AuthService를 묶고 AuthGuard를 글로벌로 등록한다.

import { Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { AppConfigModule } from "../config/app-config.module"
import { PrismaModule } from "../prisma/prisma.module"
import { SmsModule } from "../sms/sms.module"
import { AuthController } from "./auth.controller"
import { AuthGuard } from "./auth.guard"
import { AuthService } from "./auth.service"
import { JwtService } from "./jwt.service"
import { OtpService } from "./otp.service"
import { PinService } from "./pin.service"

@Module({
    imports: [AppConfigModule, PrismaModule, SmsModule],
    controllers: [AuthController],
    providers: [
        JwtService,
        OtpService,
        PinService,
        AuthService,
        { provide: APP_GUARD, useClass: AuthGuard },
    ],
    exports: [AuthService, JwtService],
})
export class AuthModule {}
