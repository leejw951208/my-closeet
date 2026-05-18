// OtpService 단위 테스트. 형식·쿨다운·리밋·만료·불일치·verify 5회 시도·세션 1회 소비.

import {
    BadRequestException,
    GoneException,
    HttpException,
    UnauthorizedException,
} from "@nestjs/common"
import { createHmac } from "node:crypto"
import { OtpService } from "./otp.service"
import { JwtService } from "./jwt.service"
import { SolapiService } from "../sms/solapi.service"
import { PrismaService } from "../prisma/prisma.service"
import { AppConfigService } from "../config/app-config.service"

const SECRET = "test-secret-test-secret-test-secret-32"

function hmac(code: string): string {
    return createHmac("sha256", SECRET).update(code).digest("hex")
}

function makeConfig(devMode = false): AppConfigService {
    return { smsDevMode: devMode, jwtSecret: SECRET } as unknown as AppConfigService
}

interface FakeOtp {
    id: string
    phoneNumber: string
    codeHash: string
    purpose: "SIGNUP" | "RESET" | "PHONE_CHANGE"
    createdAt: Date
    expiresAt: Date
    consumedAt: Date | null
    verifyAttempts: number
    sessionConsumedAt: Date | null
}

function makeFakes() {
    const otps: FakeOtp[] = []
    let seq = 0
    const sentSms: Array<{ to: string; code: string }> = []
    const solapi = {
        sendOtp: async (to: string, code: string) => {
            sentSms.push({ to, code })
        },
    } as unknown as SolapiService
    const jwt = {
        signOtpSession: () => "stub-otp-session-token",
    } as unknown as JwtService
    const prisma = {
        otpRequest: {
            findMany: async ({
                where,
            }: {
                where: { phoneNumber: string; createdAt: { gt: Date } }
            }) =>
                otps
                    .filter(
                        (o) =>
                            o.phoneNumber === where.phoneNumber &&
                            o.createdAt > where.createdAt.gt,
                    )
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
            create: async ({
                data,
            }: {
                data: Omit<FakeOtp, "id" | "createdAt" | "consumedAt" | "verifyAttempts" | "sessionConsumedAt">
            }) => {
                const created: FakeOtp = {
                    ...data,
                    id: `otp-${++seq}`,
                    createdAt: new Date(),
                    consumedAt: null,
                    verifyAttempts: 0,
                    sessionConsumedAt: null,
                }
                otps.push(created)
                return created
            },
            findUnique: async ({ where }: { where: { id: string } }) =>
                otps.find((o) => o.id === where.id) ?? null,
            update: async ({
                where,
                data,
            }: {
                where: { id: string }
                data: Partial<FakeOtp>
            }) => {
                const o = otps.find((x) => x.id === where.id)
                if (!o) throw new Error("not found")
                Object.assign(o, data)
                return o
            },
        },
        user: {
            findUnique: async () => null,
        },
    } as unknown as PrismaService
    return { otps, sentSms, prisma, solapi, jwt }
}

describe("OtpService.requestOtp", () => {
    it("잘못된 번호 형식은 400", async () => {
        const { prisma, solapi, jwt } = makeFakes()
        const svc = new OtpService(prisma, solapi, jwt, makeConfig())
        await expect(svc.requestOtp("01012345678", "SIGNUP")).rejects.toBeInstanceOf(
            BadRequestException,
        )
    })

    it("정상 발송은 requestId 반환·SMS 호출", async () => {
        const { prisma, solapi, jwt, sentSms } = makeFakes()
        const svc = new OtpService(prisma, solapi, jwt, makeConfig())
        const r = await svc.requestOtp("+821012345678", "SIGNUP")
        expect(r.expiresInSec).toBe(300)
        expect(sentSms).toHaveLength(1)
        expect(sentSms[0].code).toMatch(/^\d{6}$/)
    })

    it("1분 쿨다운 내 재요청은 429", async () => {
        const { prisma, solapi, jwt } = makeFakes()
        const svc = new OtpService(prisma, solapi, jwt, makeConfig())
        await svc.requestOtp("+821012345678", "SIGNUP")
        await expect(
            svc.requestOtp("+821012345678", "SIGNUP"),
        ).rejects.toBeInstanceOf(HttpException)
    })

    it("SMS_DEV_MODE면 응답에 devCode가 동봉된다", async () => {
        const { prisma, solapi, jwt } = makeFakes()
        const svc = new OtpService(prisma, solapi, jwt, makeConfig(true))
        const r = await svc.requestOtp("+821012345678", "SIGNUP")
        expect(r.devCode).toMatch(/^\d{6}$/)
    })

    it("기본(SMS_DEV_MODE=false)이면 devCode가 없다", async () => {
        const { prisma, solapi, jwt } = makeFakes()
        const svc = new OtpService(prisma, solapi, jwt, makeConfig(false))
        const r = await svc.requestOtp("+821012345678", "SIGNUP")
        expect(r.devCode).toBeUndefined()
    })

    it("1시간 5회 초과는 429", async () => {
        const { otps, prisma, solapi, jwt } = makeFakes()
        for (let i = 0; i < 5; i++) {
            otps.push({
                id: `pre-${i}`,
                phoneNumber: "+821012345678",
                codeHash: "x",
                purpose: "SIGNUP",
                createdAt: new Date(Date.now() - i * 60 * 1000 * 10),
                expiresAt: new Date(Date.now() + 3000),
                consumedAt: null,
                verifyAttempts: 0,
                sessionConsumedAt: null,
            })
        }
        const svc = new OtpService(prisma, solapi, jwt, makeConfig())
        await expect(
            svc.requestOtp("+821012345678", "SIGNUP"),
        ).rejects.toBeInstanceOf(HttpException)
    })
})

function seedOtp(otps: FakeOtp[], overrides: Partial<FakeOtp> = {}): FakeOtp {
    const base: FakeOtp = {
        id: "otp-x",
        phoneNumber: "+821012345678",
        codeHash: hmac("123987"),
        purpose: "SIGNUP",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        consumedAt: null,
        verifyAttempts: 0,
        sessionConsumedAt: null,
        ...overrides,
    }
    otps.push(base)
    return base
}

describe("OtpService.verifyOtp", () => {
    it("잘못된 코드 형식은 400", async () => {
        const { prisma, solapi, jwt } = makeFakes()
        const svc = new OtpService(prisma, solapi, jwt, makeConfig())
        await expect(svc.verifyOtp("any", "abc", "SIGNUP")).rejects.toBeInstanceOf(
            BadRequestException,
        )
    })

    it("만료된 OTP는 410", async () => {
        const { otps, prisma, solapi, jwt } = makeFakes()
        seedOtp(otps, {
            createdAt: new Date(Date.now() - 10 * 60 * 1000),
            expiresAt: new Date(Date.now() - 5 * 60 * 1000),
        })
        const svc = new OtpService(prisma, solapi, jwt, makeConfig())
        await expect(svc.verifyOtp("otp-x", "123987", "SIGNUP")).rejects.toBeInstanceOf(
            GoneException,
        )
    })

    it("코드 불일치는 400 + verifyAttempts 증가", async () => {
        const { otps, prisma, solapi, jwt } = makeFakes()
        seedOtp(otps)
        const svc = new OtpService(prisma, solapi, jwt, makeConfig())
        await expect(svc.verifyOtp("otp-x", "999999", "SIGNUP")).rejects.toBeInstanceOf(
            BadRequestException,
        )
        expect(otps[0].verifyAttempts).toBe(1)
        expect(otps[0].consumedAt).toBeNull()
    })

    it("5회 연속 실패 시 강제 consume + 429", async () => {
        const { otps, prisma, solapi, jwt } = makeFakes()
        seedOtp(otps, { verifyAttempts: 4 })
        const svc = new OtpService(prisma, solapi, jwt, makeConfig())
        await expect(svc.verifyOtp("otp-x", "999999", "SIGNUP")).rejects.toBeInstanceOf(
            HttpException,
        )
        expect(otps[0].verifyAttempts).toBe(5)
        expect(otps[0].consumedAt).toBeTruthy()
    })

    it("정상 검증은 세션 토큰 반환·consumed 표시", async () => {
        const { otps, prisma, solapi, jwt } = makeFakes()
        seedOtp(otps)
        const svc = new OtpService(prisma, solapi, jwt, makeConfig())
        const r = await svc.verifyOtp("otp-x", "123987", "SIGNUP")
        expect(r.otpSessionToken).toBe("stub-otp-session-token")
        expect(r.isNewUser).toBe(true)
        expect(otps[0].consumedAt).toBeTruthy()
    })
})

describe("OtpService.consumeSession", () => {
    it("jti 누락은 401", async () => {
        const { prisma, solapi, jwt } = makeFakes()
        const svc = new OtpService(prisma, solapi, jwt, makeConfig())
        await expect(svc.consumeSession(undefined)).rejects.toBeInstanceOf(
            UnauthorizedException,
        )
    })

    it("최초 호출은 sessionConsumedAt을 마킹", async () => {
        const { otps, prisma, solapi, jwt } = makeFakes()
        seedOtp(otps)
        const svc = new OtpService(prisma, solapi, jwt, makeConfig())
        await svc.consumeSession("otp-x")
        expect(otps[0].sessionConsumedAt).toBeTruthy()
    })

    it("이미 소비된 세션 재사용은 401", async () => {
        const { otps, prisma, solapi, jwt } = makeFakes()
        seedOtp(otps, { sessionConsumedAt: new Date() })
        const svc = new OtpService(prisma, solapi, jwt, makeConfig())
        await expect(svc.consumeSession("otp-x")).rejects.toBeInstanceOf(
            UnauthorizedException,
        )
    })
})
