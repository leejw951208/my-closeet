// AuthService 통합 흐름 단위 테스트. signupComplete·pinReset·changePhone·logout·purpose 검증.

import {
    BadRequestException,
    ConflictException,
    UnauthorizedException,
} from "@nestjs/common"
import { AuthService } from "./auth.service"
import { JwtService } from "./jwt.service"
import { OtpService } from "./otp.service"
import { PinService } from "./pin.service"
import { PrismaService } from "../prisma/prisma.service"

interface FakeUser {
    id: string
    phoneNumber: string
    pinHash: string
}

function fakes() {
    const users: FakeUser[] = []
    const phoneChangeLog: Array<{ userId: string; oldPhone: string; newPhone: string }> =
        []
    let userSeq = 0
    const prisma = {
        user: {
            findUnique: async ({ where }: { where: { phoneNumber?: string; id?: string } }) =>
                users.find((u) =>
                    where.phoneNumber
                        ? u.phoneNumber === where.phoneNumber
                        : u.id === where.id,
                ) ?? null,
            findUniqueOrThrow: async ({ where }: { where: { id: string } }) => {
                const u = users.find((x) => x.id === where.id)
                if (!u) throw new Error("not found")
                return u
            },
            create: async ({ data }: { data: { phoneNumber: string; pinHash: string } }) => {
                const u: FakeUser = {
                    id: `u-${++userSeq}`,
                    phoneNumber: data.phoneNumber,
                    pinHash: data.pinHash,
                }
                users.push(u)
                return u
            },
        },
        $transaction: async (fn: (tx: unknown) => Promise<unknown>) => {
            return fn({
                user: {
                    findUniqueOrThrow: prisma.user.findUniqueOrThrow,
                    update: async ({
                        where,
                        data,
                    }: {
                        where: { id: string }
                        data: { phoneNumber: string }
                    }) => {
                        const u = users.find((x) => x.id === where.id)
                        if (!u) throw new Error("not found")
                        u.phoneNumber = data.phoneNumber
                        return u
                    },
                },
                phoneChangeLog: {
                    create: async ({ data }: { data: { userId: string; oldPhone: string; newPhone: string } }) => {
                        phoneChangeLog.push(data)
                        return data
                    },
                },
            })
        },
    } as unknown as PrismaService

    const jwt = {
        verifyOtpSession: jest.fn(),
        issuePair: jest.fn(async () => ({
            accessToken: "AT",
            refreshToken: "uuid.secret",
        })),
        revokeAllForUser: jest.fn(async () => undefined),
        revokeOne: jest.fn(async () => undefined),
        rotate: jest.fn(),
    } as unknown as JwtService

    const otp = {
        consumeSession: jest.fn(async () => undefined),
    } as unknown as OtpService

    const pin = {
        hash: jest.fn(async () => "hashed-pin"),
        verify: jest.fn(),
        resetPin: jest.fn(async () => undefined),
    } as unknown as PinService

    return { users, phoneChangeLog, prisma, jwt, otp, pin }
}

describe("AuthService.signupComplete", () => {
    it("purpose 불일치는 400 + session consume 호출 안 됨", async () => {
        const { prisma, jwt, otp, pin } = fakes()
        ;(jwt.verifyOtpSession as jest.Mock).mockReturnValue({
            phoneNumber: "+821011112222",
            purpose: "RESET",
            jti: "j1",
        })
        const svc = new AuthService(prisma, otp, pin, jwt)
        await expect(svc.signupComplete("tok", "482913", "d1")).rejects.toBeInstanceOf(
            BadRequestException,
        )
        expect(otp.consumeSession).not.toHaveBeenCalled()
    })

    it("중복 가입은 409", async () => {
        const { users, prisma, jwt, otp, pin } = fakes()
        users.push({ id: "u-0", phoneNumber: "+821011112222", pinHash: "x" })
        ;(jwt.verifyOtpSession as jest.Mock).mockReturnValue({
            phoneNumber: "+821011112222",
            purpose: "SIGNUP",
            jti: "j1",
        })
        const svc = new AuthService(prisma, otp, pin, jwt)
        await expect(svc.signupComplete("tok", "482913", "d1")).rejects.toBeInstanceOf(
            ConflictException,
        )
        expect(otp.consumeSession).toHaveBeenCalledWith("j1")
    })

    it("정상 가입은 토큰 발급", async () => {
        const { prisma, jwt, otp, pin } = fakes()
        ;(jwt.verifyOtpSession as jest.Mock).mockReturnValue({
            phoneNumber: "+821011112222",
            purpose: "SIGNUP",
            jti: "j1",
        })
        // Prisma.create override - 위 fakes의 create는 closet 인자를 받지 않으므로 단순화.
        ;(prisma.user.create as unknown as jest.Mock) = jest.fn(async ({ data }) => ({
            id: "u-new",
            phoneNumber: data.phoneNumber,
            pinHash: data.pinHash,
        }))
        const svc = new AuthService(prisma, otp, pin, jwt)
        const res = await svc.signupComplete("tok", "482913", "d1")
        expect(res.user).toEqual({ id: "u-new", phoneNumber: "+821011112222" })
        expect(res.accessToken).toBe("AT")
        expect(otp.consumeSession).toHaveBeenCalled()
    })
})

describe("AuthService.pinReset", () => {
    it("purpose 또는 userId 누락은 400", async () => {
        const { prisma, jwt, otp, pin } = fakes()
        ;(jwt.verifyOtpSession as jest.Mock).mockReturnValue({
            phoneNumber: "+821011112222",
            purpose: "RESET",
            jti: "j1",
        })
        const svc = new AuthService(prisma, otp, pin, jwt)
        await expect(svc.pinReset("tok", "482913", "d1")).rejects.toBeInstanceOf(
            BadRequestException,
        )
    })

    it("정상 재설정은 모든 refresh를 무효화 후 새 쌍 발급", async () => {
        const { users, prisma, jwt, otp, pin } = fakes()
        users.push({ id: "u-1", phoneNumber: "+821011112222", pinHash: "old" })
        ;(jwt.verifyOtpSession as jest.Mock).mockReturnValue({
            phoneNumber: "+821011112222",
            purpose: "RESET",
            userId: "u-1",
            jti: "j1",
        })
        const svc = new AuthService(prisma, otp, pin, jwt)
        const res = await svc.pinReset("tok", "482913", "d1")
        expect(res.accessToken).toBe("AT")
        expect(jwt.revokeAllForUser).toHaveBeenCalledWith("u-1")
        expect(pin.resetPin).toHaveBeenCalledWith("u-1", "482913")
    })
})

describe("AuthService.changePhone", () => {
    it("두 세션 모두 PHONE_CHANGE 가 아니면 400", async () => {
        const { prisma, jwt, otp, pin } = fakes()
        ;(jwt.verifyOtpSession as jest.Mock).mockReturnValueOnce({
            phoneNumber: "+821011112222",
            purpose: "SIGNUP",
            userId: "u-1",
            jti: "j1",
        })
        ;(jwt.verifyOtpSession as jest.Mock).mockReturnValueOnce({
            phoneNumber: "+821033334444",
            purpose: "PHONE_CHANGE",
            jti: "j2",
        })
        const svc = new AuthService(prisma, otp, pin, jwt)
        await expect(svc.changePhone("a", "b")).rejects.toBeInstanceOf(
            BadRequestException,
        )
    })

    it("새 번호가 다른 사용자에 등록되어 있으면 409", async () => {
        const { users, prisma, jwt, otp, pin } = fakes()
        users.push({ id: "u-1", phoneNumber: "+821011112222", pinHash: "x" })
        users.push({ id: "u-2", phoneNumber: "+821033334444", pinHash: "x" })
        ;(jwt.verifyOtpSession as jest.Mock).mockReturnValueOnce({
            phoneNumber: "+821011112222",
            purpose: "PHONE_CHANGE",
            userId: "u-1",
            jti: "j1",
        })
        ;(jwt.verifyOtpSession as jest.Mock).mockReturnValueOnce({
            phoneNumber: "+821033334444",
            purpose: "PHONE_CHANGE",
            jti: "j2",
        })
        const svc = new AuthService(prisma, otp, pin, jwt)
        await expect(svc.changePhone("a", "b")).rejects.toBeInstanceOf(
            ConflictException,
        )
    })

    it("정상 변경은 phoneChangeLog 기록 + refresh 무효화", async () => {
        const { users, phoneChangeLog, prisma, jwt, otp, pin } = fakes()
        users.push({ id: "u-1", phoneNumber: "+821011112222", pinHash: "x" })
        ;(jwt.verifyOtpSession as jest.Mock).mockReturnValueOnce({
            phoneNumber: "+821011112222",
            purpose: "PHONE_CHANGE",
            userId: "u-1",
            jti: "j1",
        })
        ;(jwt.verifyOtpSession as jest.Mock).mockReturnValueOnce({
            phoneNumber: "+821033334444",
            purpose: "PHONE_CHANGE",
            jti: "j2",
        })
        const svc = new AuthService(prisma, otp, pin, jwt)
        const res = await svc.changePhone("a", "b")
        expect(res.phoneNumber).toBe("+821033334444")
        expect(phoneChangeLog).toHaveLength(1)
        expect(jwt.revokeAllForUser).toHaveBeenCalledWith("u-1")
    })
})

describe("AuthService.logout", () => {
    it("revokeOne을 userId로 호출한다 (ownership 검증)", async () => {
        const { prisma, jwt, otp, pin } = fakes()
        const svc = new AuthService(prisma, otp, pin, jwt)
        await svc.logout("u-1", "uuid.secret")
        expect(jwt.revokeOne).toHaveBeenCalledWith("u-1", "uuid.secret")
    })
})

describe("AuthService.pinLogin", () => {
    it("사용자 없으면 401", async () => {
        const { prisma, jwt, otp, pin } = fakes()
        const svc = new AuthService(prisma, otp, pin, jwt)
        await expect(svc.pinLogin("+821099999999", "482913", "d1")).rejects.toBeInstanceOf(
            UnauthorizedException,
        )
    })
})
