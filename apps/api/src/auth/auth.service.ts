// 인증 흐름 오케스트레이션. OTP 세션 토큰을 받아 가입 완료·PIN 로그인·재설정·번호 변경·로그아웃을 수행한다.

import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { JwtService } from "./jwt.service"
import { OtpService } from "./otp.service"
import { PinService } from "./pin.service"
import { TokenPair } from "./auth.types"

export interface SignupResult extends TokenPair {
    user: { id: string; phoneNumber: string }
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly otp: OtpService,
        private readonly pin: PinService,
        private readonly jwt: JwtService,
    ) {}

    async signupComplete(
        otpSessionToken: string,
        pin: string,
        deviceId: string,
    ): Promise<SignupResult> {
        const session = this.jwt.verifyOtpSession(otpSessionToken)
        if (session.purpose !== "SIGNUP") {
            throw new BadRequestException({
                code: "wrong_purpose",
                message: "잘못된 인증 세션입니다.",
            })
        }
        await this.otp.consumeSession(session.jti)
        const existing = await this.prisma.user.findUnique({
            where: { phoneNumber: session.phoneNumber },
        })
        if (existing) {
            throw new ConflictException({
                code: "phone_already_registered",
                message: "이미 등록된 번호입니다.",
            })
        }
        const pinHash = await this.pin.hash(pin)
        const user = await this.prisma.user.create({
            data: {
                phoneNumber: session.phoneNumber,
                pinHash,
                lastSignInAt: new Date(),
                closet: { create: {} },
            },
        })
        const tokens = await this.jwt.issuePair(user.id, user.phoneNumber, deviceId)
        return { ...tokens, user: { id: user.id, phoneNumber: user.phoneNumber } }
    }

    async pinLogin(phoneNumber: string, pin: string, deviceId: string): Promise<TokenPair> {
        const user = await this.prisma.user.findUnique({ where: { phoneNumber } })
        if (!user) {
            throw new UnauthorizedException({
                code: "invalid_credentials",
                message: "휴대폰 번호 또는 PIN이 잘못되었습니다.",
            })
        }
        const result = await this.pin.verify(user.id, pin)
        if (!result.ok) {
            throw new UnauthorizedException({
                code: "invalid_credentials",
                message: "휴대폰 번호 또는 PIN이 잘못되었습니다.",
                remainingAttempts: result.remainingAttempts,
            } as Record<string, unknown>)
        }
        return this.jwt.issuePair(user.id, user.phoneNumber, deviceId)
    }

    async pinReset(
        otpSessionToken: string,
        newPin: string,
        deviceId: string,
    ): Promise<TokenPair> {
        const session = this.jwt.verifyOtpSession(otpSessionToken)
        if (session.purpose !== "RESET" || !session.userId) {
            throw new BadRequestException({
                code: "wrong_purpose",
                message: "잘못된 인증 세션입니다.",
            })
        }
        await this.otp.consumeSession(session.jti)
        await this.pin.resetPin(session.userId, newPin)
        await this.jwt.revokeAllForUser(session.userId)
        const user = await this.prisma.user.findUniqueOrThrow({
            where: { id: session.userId },
        })
        return this.jwt.issuePair(user.id, user.phoneNumber, deviceId)
    }

    async changePhone(
        currentOtpSessionToken: string,
        newOtpSessionToken: string,
    ): Promise<{ id: string; phoneNumber: string }> {
        const current = this.jwt.verifyOtpSession(currentOtpSessionToken)
        const next = this.jwt.verifyOtpSession(newOtpSessionToken)
        if (current.purpose !== "PHONE_CHANGE" || next.purpose !== "PHONE_CHANGE") {
            throw new BadRequestException({
                code: "wrong_purpose",
                message: "잘못된 인증 세션입니다.",
            })
        }
        await this.otp.consumeSession(current.jti)
        await this.otp.consumeSession(next.jti)
        if (!current.userId) {
            throw new BadRequestException({
                code: "missing_user",
                message: "사용자 정보가 없습니다.",
            })
        }
        const duplicate = await this.prisma.user.findUnique({
            where: { phoneNumber: next.phoneNumber },
        })
        if (duplicate && duplicate.id !== current.userId) {
            throw new ConflictException({
                code: "phone_already_registered",
                message: "이미 사용 중인 번호입니다.",
            })
        }
        const userId = current.userId
        const updated = await this.prisma.$transaction(async (tx) => {
            const before = await tx.user.findUniqueOrThrow({ where: { id: userId } })
            const after = await tx.user.update({
                where: { id: userId },
                data: { phoneNumber: next.phoneNumber },
            })
            await tx.phoneChangeLog.create({
                data: {
                    userId,
                    oldPhone: before.phoneNumber,
                    newPhone: after.phoneNumber,
                },
            })
            return after
        })
        await this.jwt.revokeAllForUser(userId)
        return { id: updated.id, phoneNumber: updated.phoneNumber }
    }

    async logout(userId: string, refreshToken: string): Promise<void> {
        await this.jwt.revokeOne(userId, refreshToken)
    }

    async getMe(userId: string): Promise<{
        id: string
        phoneNumber: string
        createdAt: Date
        lastSignInAt: Date | null
    }> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            throw new NotFoundException({
                code: "user_not_found",
                message: "사용자를 찾을 수 없습니다.",
            })
        }
        return {
            id: user.id,
            phoneNumber: user.phoneNumber,
            createdAt: user.createdAt,
            lastSignInAt: user.lastSignInAt,
        }
    }

    requestOtp(...args: Parameters<OtpService["requestOtp"]>) {
        return this.otp.requestOtp(...args)
    }
    verifyOtp(...args: Parameters<OtpService["verifyOtp"]>) {
        return this.otp.verifyOtp(...args)
    }
    refresh(presented: string) {
        return this.jwt.rotate(presented)
    }
}
