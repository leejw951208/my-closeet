// JwtService 단위 테스트. access·OTP 세션·refresh 발급·검증·회전·재사용 감지.

import { UnauthorizedException } from "@nestjs/common"
import { JwtService } from "./jwt.service"
import { AppConfigService } from "../config/app-config.service"
import { PrismaService } from "../prisma/prisma.service"

const SECRET = "test-secret-test-secret-test-secret-32"

function makeConfig(): AppConfigService {
    return {
        jwtSecret: SECRET,
        jwtAccessTtlMin: 30,
        jwtRefreshTtlDays: 30,
        otpSessionTtlMin: 5,
    } as unknown as AppConfigService
}

interface FakeRefresh {
    id: string
    userId: string
    lookupKey: string
    tokenHash: string
    deviceId: string
    expiresAt: Date
    revokedAt: Date | null
    createdAt: Date
    user: { phoneNumber: string }
}

function makePrisma() {
    const tokens: FakeRefresh[] = []
    let seq = 0
    return {
        tokens,
        prisma: {
            refreshToken: {
                create: async ({
                    data,
                }: {
                    data: Omit<FakeRefresh, "id" | "createdAt" | "user" | "revokedAt">
                }) => {
                    const created: FakeRefresh = {
                        ...data,
                        id: `rt-${++seq}`,
                        createdAt: new Date(),
                        revokedAt: null,
                        user: { phoneNumber: "+821011112222" },
                    }
                    tokens.push(created)
                    return created
                },
                findUnique: async ({
                    where,
                    include,
                }: {
                    where: { lookupKey: string }
                    include?: { user: boolean }
                }) => {
                    const t = tokens.find((x) => x.lookupKey === where.lookupKey)
                    if (!t) return null
                    return include?.user ? t : { ...t, user: undefined }
                },
                update: async ({
                    where,
                    data,
                }: {
                    where: { id: string }
                    data: Partial<FakeRefresh>
                }) => {
                    const t = tokens.find((x) => x.id === where.id)
                    if (!t) throw new Error("not found")
                    Object.assign(t, data)
                    return t
                },
                updateMany: async ({
                    where,
                    data,
                }: {
                    where: { userId: string; revokedAt: null }
                    data: Partial<FakeRefresh>
                }) => {
                    let count = 0
                    for (const t of tokens) {
                        if (t.userId === where.userId && t.revokedAt === null) {
                            Object.assign(t, data)
                            count++
                        }
                    }
                    return { count }
                },
            },
        } as unknown as PrismaService,
    }
}

describe("JwtService", () => {
    it("access 토큰을 발급·검증한다", async () => {
        const { prisma } = makePrisma()
        const svc = new JwtService(makeConfig(), prisma)
        const pair = await svc.issuePair("u1", "+821011112222", "d1")
        expect(pair.accessToken).toBeTruthy()
        expect(pair.refreshToken).toMatch(/^[0-9a-f-]+\.[0-9a-f]+$/)
        const payload = svc.verifyAccess(pair.accessToken)
        expect(payload.sub).toBe("u1")
        expect(payload.phoneNumber).toBe("+821011112222")
    })

    it("잘못된 access는 401", () => {
        const { prisma } = makePrisma()
        const svc = new JwtService(makeConfig(), prisma)
        expect(() => svc.verifyAccess("garbage")).toThrow(UnauthorizedException)
    })

    it("OTP 세션 토큰을 발급·검증한다 (jti 포함)", () => {
        const { prisma } = makePrisma()
        const svc = new JwtService(makeConfig(), prisma)
        const tok = svc.signOtpSession({
            phoneNumber: "+821011112222",
            purpose: "SIGNUP",
            jti: "otp-abc",
        })
        const decoded = svc.verifyOtpSession(tok)
        expect(decoded.phoneNumber).toBe("+821011112222")
        expect(decoded.purpose).toBe("SIGNUP")
        expect(decoded.jti).toBe("otp-abc")
    })

    it("OTP 세션을 access로 잘못 검증하면 401", () => {
        const { prisma } = makePrisma()
        const svc = new JwtService(makeConfig(), prisma)
        const otp = svc.signOtpSession({
            phoneNumber: "+821011112222",
            purpose: "SIGNUP",
        })
        expect(() => svc.verifyAccess(otp)).toThrow(UnauthorizedException)
    })

    it("refresh 회전은 구 토큰을 무효화하고 새 쌍을 발급한다", async () => {
        const { prisma, tokens } = makePrisma()
        const svc = new JwtService(makeConfig(), prisma)
        const first = await svc.issuePair("u1", "+821011112222", "d1")
        const second = await svc.rotate(first.refreshToken)
        expect(second.refreshToken).not.toBe(first.refreshToken)
        expect(tokens[0].revokedAt).toBeTruthy()
        expect(tokens[1].revokedAt).toBeNull()
    })

    it("revokeAllForUser는 해당 user의 활성 토큰을 모두 무효화", async () => {
        const { prisma, tokens } = makePrisma()
        const svc = new JwtService(makeConfig(), prisma)
        await svc.issuePair("u1", "+821011112222", "d1")
        await svc.issuePair("u1", "+821011112222", "d2")
        await svc.revokeAllForUser("u1")
        expect(tokens.every((t) => t.revokedAt !== null)).toBe(true)
    })

    it("이미 회전된 refresh 재사용은 401 + 해당 사용자 전체 토큰 무효화", async () => {
        const { prisma, tokens } = makePrisma()
        const svc = new JwtService(makeConfig(), prisma)
        const first = await svc.issuePair("u1", "+821011112222", "d1")
        await svc.issuePair("u1", "+821011112222", "d2")
        await svc.rotate(first.refreshToken)
        // first를 다시 제시 → 탈취 감지.
        await expect(svc.rotate(first.refreshToken)).rejects.toBeInstanceOf(
            UnauthorizedException,
        )
        expect(tokens.every((t) => t.revokedAt !== null)).toBe(true)
    })

    it("revokeOne은 다른 사용자 소유의 refresh는 무효화하지 않는다", async () => {
        const { prisma, tokens } = makePrisma()
        const svc = new JwtService(makeConfig(), prisma)
        const a = await svc.issuePair("u1", "+821011112222", "d1")
        await svc.revokeOne("u2", a.refreshToken)
        expect(tokens[0].revokedAt).toBeNull()
        await svc.revokeOne("u1", a.refreshToken)
        expect(tokens[0].revokedAt).toBeTruthy()
    })
})
