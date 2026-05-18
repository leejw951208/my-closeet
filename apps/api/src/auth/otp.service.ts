// OTP 발송 요청·검증 서비스. 솔라피로 SMS를 보내고 5분 TTL·1분 쿨다운·1시간 5회 리밋·verify 5회 시도 제한을 강제한다.

import {
    BadRequestException,
    GoneException,
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common"
import { createHmac, timingSafeEqual } from "node:crypto"
import { randomInt } from "node:crypto"
import { OtpPurpose as DbOtpPurpose } from "@my-closet/database"
import { AppConfigService } from "../config/app-config.service"
import { PrismaService } from "../prisma/prisma.service"
import { SolapiService } from "../sms/solapi.service"
import { JwtService } from "./jwt.service"
import { OtpPurpose } from "./auth.types"

const OTP_TTL_SECONDS = 5 * 60
const OTP_COOLDOWN_SECONDS = 60
const OTP_WINDOW_SECONDS = 60 * 60
const OTP_WINDOW_LIMIT = 5
const OTP_VERIFY_ATTEMPT_LIMIT = 5

const PURPOSE_DB_MAP: Record<OtpPurpose, DbOtpPurpose> = {
    SIGNUP: DbOtpPurpose.SIGNUP,
    RESET: DbOtpPurpose.RESET,
    PHONE_CHANGE: DbOtpPurpose.PHONE_CHANGE,
}

export interface RequestOtpResult {
    requestId: string
    expiresInSec: number
    devCode?: string
}

export interface VerifyOtpResult {
    otpSessionToken: string
    isNewUser: boolean
}

@Injectable()
export class OtpService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly solapi: SolapiService,
        private readonly jwt: JwtService,
        private readonly config: AppConfigService,
    ) {}

    async requestOtp(phoneNumber: string, purpose: OtpPurpose): Promise<RequestOtpResult> {
        this.assertPhone(phoneNumber)
        const now = new Date()
        const windowStart = new Date(now.getTime() - OTP_WINDOW_SECONDS * 1000)
        const recent = await this.prisma.otpRequest.findMany({
            where: { phoneNumber, createdAt: { gt: windowStart } },
            orderBy: { createdAt: "desc" },
        })
        if (recent.length >= OTP_WINDOW_LIMIT) {
            throw new HttpException(
                { code: "otp_rate_limited", message: "1시간 후 다시 시도해주세요." },
                HttpStatus.TOO_MANY_REQUESTS,
            )
        }
        const last = recent[0]
        if (last && last.createdAt.getTime() > now.getTime() - OTP_COOLDOWN_SECONDS * 1000) {
            throw new HttpException(
                { code: "otp_cooldown", message: "1분 후 다시 시도해주세요." },
                HttpStatus.TOO_MANY_REQUESTS,
            )
        }
        const code = this.generateCode()
        const codeHash = this.hmacCode(code)
        const created = await this.prisma.otpRequest.create({
            data: {
                phoneNumber,
                codeHash,
                purpose: PURPOSE_DB_MAP[purpose],
                expiresAt: new Date(now.getTime() + OTP_TTL_SECONDS * 1000),
            },
        })
        await this.solapi.sendOtp(phoneNumber, code)
        const base = { requestId: created.id, expiresInSec: OTP_TTL_SECONDS }
        return this.config.smsDevMode ? { ...base, devCode: code } : base
    }

    async verifyOtp(
        requestId: string,
        code: string,
        purpose: OtpPurpose,
    ): Promise<VerifyOtpResult> {
        if (!/^\d{6}$/.test(code)) {
            throw new BadRequestException({
                code: "invalid_otp_format",
                message: "인증번호는 6자리 숫자입니다.",
            })
        }
        const record = await this.prisma.otpRequest.findUnique({ where: { id: requestId } })
        if (!record || record.purpose !== PURPOSE_DB_MAP[purpose]) {
            throw new BadRequestException({
                code: "invalid_otp",
                message: "잘못된 인증 요청입니다.",
            })
        }
        if (record.consumedAt) {
            throw new BadRequestException({
                code: "otp_consumed",
                message: "이미 사용한 인증번호입니다.",
            })
        }
        if (record.expiresAt < new Date()) {
            throw new GoneException({
                code: "otp_expired",
                message: "인증번호가 만료되었습니다.",
            })
        }
        if (!this.compareCode(code, record.codeHash)) {
            const attempts = record.verifyAttempts + 1
            const willLock = attempts >= OTP_VERIFY_ATTEMPT_LIMIT
            await this.prisma.otpRequest.update({
                where: { id: record.id },
                data: {
                    verifyAttempts: attempts,
                    consumedAt: willLock ? new Date() : null,
                },
            })
            if (willLock) {
                throw new HttpException(
                    {
                        code: "otp_attempts_exhausted",
                        message: "인증 시도 횟수를 초과했습니다. 다시 발송해주세요.",
                    },
                    HttpStatus.TOO_MANY_REQUESTS,
                )
            }
            throw new BadRequestException({
                code: "otp_mismatch",
                message: "인증번호가 일치하지 않습니다.",
            })
        }
        await this.prisma.otpRequest.update({
            where: { id: record.id },
            data: { consumedAt: new Date() },
        })
        const user = await this.prisma.user.findUnique({
            where: { phoneNumber: record.phoneNumber },
        })
        const token = this.jwt.signOtpSession({
            phoneNumber: record.phoneNumber,
            purpose,
            userId: user?.id,
            jti: record.id,
        })
        if (purpose === "SIGNUP" && !user) {
            return { otpSessionToken: token, isNewUser: true }
        }
        if (purpose === "RESET" && !user) {
            throw new UnauthorizedException({
                code: "user_not_found",
                message: "등록되지 않은 번호입니다.",
            })
        }
        return { otpSessionToken: token, isNewUser: false }
    }

    /**
     * verifyOtpSession 통과한 토큰의 jti를 1회용으로 소비한다. 이미 소비됐으면 throw.
     * signup/pinReset/phoneChange의 진입 직전에 호출.
     */
    async consumeSession(jti: string | undefined): Promise<void> {
        if (!jti) {
            throw new UnauthorizedException({
                code: "invalid_otp_session",
                message: "OTP 세션이 만료되었습니다.",
            })
        }
        const record = await this.prisma.otpRequest.findUnique({ where: { id: jti } })
        if (!record || record.sessionConsumedAt) {
            throw new UnauthorizedException({
                code: "otp_session_consumed",
                message: "이미 사용한 인증 세션입니다.",
            })
        }
        await this.prisma.otpRequest.update({
            where: { id: jti },
            data: { sessionConsumedAt: new Date() },
        })
    }

    private assertPhone(phoneNumber: string): void {
        if (!/^\+82\d{9,10}$/.test(phoneNumber)) {
            throw new BadRequestException({
                code: "invalid_phone_format",
                message: "휴대폰 번호 형식을 확인해주세요.",
            })
        }
    }

    private generateCode(): string {
        return String(randomInt(0, 1_000_000)).padStart(6, "0")
    }

    private hmacCode(code: string): string {
        return createHmac("sha256", this.config.jwtSecret).update(code).digest("hex")
    }

    private compareCode(code: string, expectedHex: string): boolean {
        const actual = Buffer.from(this.hmacCode(code), "hex")
        const expected = Buffer.from(expectedHex, "hex")
        if (actual.length !== expected.length) return false
        return timingSafeEqual(actual, expected)
    }
}
