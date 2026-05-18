// JWT 발급·검증 서비스. access(단명) + refresh(장기, DB lookup·회전·재사용 감지) 쌍과 OTP 세션 토큰을 다룬다.

import { Injectable, UnauthorizedException } from "@nestjs/common"
import * as bcrypt from "bcryptjs"
import * as jwt from "jsonwebtoken"
import { createHash, randomBytes, randomUUID } from "node:crypto"
import { AppConfigService } from "../config/app-config.service"
import { PrismaService } from "../prisma/prisma.service"
import {
    AccessTokenPayload,
    OtpSessionPayload,
    TokenPair,
} from "./auth.types"

const REFRESH_BCRYPT_COST = 10

@Injectable()
export class JwtService {
    constructor(
        private readonly config: AppConfigService,
        private readonly prisma: PrismaService,
    ) {}

    async issuePair(userId: string, phoneNumber: string, deviceId: string): Promise<TokenPair> {
        const accessToken = this.signAccess({ sub: userId, phoneNumber })
        const tokenId = randomUUID()
        const secret = randomBytes(24).toString("hex")
        const refreshToken = `${tokenId}.${secret}`
        const lookupKey = this.deriveLookupKey(tokenId)
        const tokenHash = await bcrypt.hash(secret, REFRESH_BCRYPT_COST)
        const expiresAt = new Date(
            Date.now() + this.config.jwtRefreshTtlDays * 24 * 3600 * 1000,
        )
        await this.prisma.refreshToken.create({
            data: { userId, lookupKey, tokenHash, deviceId, expiresAt },
        })
        return { accessToken, refreshToken }
    }

    async rotate(presentedRefresh: string): Promise<TokenPair> {
        const parsed = this.parseToken(presentedRefresh)
        if (!parsed) throw this.invalidRefresh()
        const record = await this.prisma.refreshToken.findUnique({
            where: { lookupKey: parsed.lookupKey },
            include: { user: true },
        })
        if (!record) throw this.invalidRefresh()
        const match = await bcrypt.compare(parsed.secret, record.tokenHash)
        if (!match) throw this.invalidRefresh()
        if (record.revokedAt) {
            // 이미 회전된 refresh를 재제시 = 탈취 가능성. 해당 사용자 전체 토큰 무효화.
            await this.revokeAllForUser(record.userId)
            throw this.invalidRefresh()
        }
        if (record.expiresAt <= new Date()) throw this.invalidRefresh()
        await this.prisma.refreshToken.update({
            where: { id: record.id },
            data: { revokedAt: new Date() },
        })
        return this.issuePair(
            record.userId,
            record.user.phoneNumber,
            record.deviceId,
        )
    }

    async revokeAllForUser(userId: string): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        })
    }

    async revokeOne(userId: string, presentedRefresh: string): Promise<void> {
        const parsed = this.parseToken(presentedRefresh)
        if (!parsed) return
        const record = await this.prisma.refreshToken.findUnique({
            where: { lookupKey: parsed.lookupKey },
        })
        if (!record || record.userId !== userId || record.revokedAt) return
        const match = await bcrypt.compare(parsed.secret, record.tokenHash)
        if (!match) return
        await this.prisma.refreshToken.update({
            where: { id: record.id },
            data: { revokedAt: new Date() },
        })
    }

    verifyAccess(token: string): AccessTokenPayload {
        try {
            const payload = jwt.verify(token, this.config.jwtSecret, {
                algorithms: ["HS256"],
            }) as AccessTokenPayload & { typ?: string }
            if (payload.typ && payload.typ !== "access") {
                throw new Error("not access token")
            }
            return { sub: payload.sub, phoneNumber: payload.phoneNumber }
        } catch {
            throw new UnauthorizedException({
                code: "unauthorized",
                message: "Invalid or expired token",
            })
        }
    }

    signOtpSession(payload: OtpSessionPayload): string {
        return jwt.sign({ ...payload, typ: "otp_session" }, this.config.jwtSecret, {
            algorithm: "HS256",
            expiresIn: `${this.config.otpSessionTtlMin}m`,
        })
    }

    verifyOtpSession(token: string): OtpSessionPayload {
        try {
            const payload = jwt.verify(token, this.config.jwtSecret, {
                algorithms: ["HS256"],
            }) as OtpSessionPayload & { typ?: string }
            if (payload.typ !== "otp_session") {
                throw new Error("not otp session")
            }
            return {
                phoneNumber: payload.phoneNumber,
                purpose: payload.purpose,
                userId: payload.userId,
                jti: payload.jti,
            }
        } catch {
            throw new UnauthorizedException({
                code: "invalid_otp_session",
                message: "OTP 세션이 만료되었습니다.",
            })
        }
    }

    private parseToken(raw: string): { lookupKey: string; secret: string } | null {
        const idx = raw.indexOf(".")
        if (idx <= 0 || idx === raw.length - 1) return null
        const tokenId = raw.slice(0, idx)
        const secret = raw.slice(idx + 1)
        return { lookupKey: this.deriveLookupKey(tokenId), secret }
    }

    private deriveLookupKey(tokenId: string): string {
        return createHash("sha256").update(tokenId).digest("hex")
    }

    private invalidRefresh(): UnauthorizedException {
        return new UnauthorizedException({
            code: "invalid_refresh",
            message: "Refresh token이 유효하지 않습니다.",
        })
    }

    private signAccess(payload: AccessTokenPayload): string {
        return jwt.sign({ ...payload, typ: "access" }, this.config.jwtSecret, {
            algorithm: "HS256",
            expiresIn: `${this.config.jwtAccessTtlMin}m`,
        })
    }
}
