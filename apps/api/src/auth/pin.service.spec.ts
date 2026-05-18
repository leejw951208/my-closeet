// PinService 단위 테스트. 형식 거부, 잠금 카운터, 재설정.

import { BadRequestException, HttpException } from "@nestjs/common"
import { PinService } from "./pin.service"

interface FakeUser {
    id: string
    pinHash: string
    pinFailedCount: number
    pinLockedUntil: Date | null
}

function makePrisma(initial: FakeUser) {
    const users = new Map<string, FakeUser>([[initial.id, { ...initial }]])
    const pinResetLog: Array<{ userId: string }> = []
    const txCalls = (fns: unknown[]) => Promise.all(fns as Promise<unknown>[])
    return {
        users,
        pinResetLog,
        prisma: {
            user: {
                findUniqueOrThrow: async ({ where }: { where: { id: string } }) => {
                    const u = users.get(where.id)
                    if (!u) throw new Error("not found")
                    return u
                },
                update: async ({
                    where,
                    data,
                }: {
                    where: { id: string }
                    data: Partial<FakeUser>
                }) => {
                    const u = users.get(where.id)
                    if (!u) throw new Error("not found")
                    Object.assign(u, data)
                    return u
                },
            },
            pinResetLog: {
                create: async ({ data }: { data: { userId: string } }) => {
                    pinResetLog.push(data)
                    return data
                },
            },
            $transaction: txCalls,
        } as unknown as ConstructorParameters<typeof PinService>[0],
    }
}

describe("PinService", () => {
    it("형식 위반 PIN은 거부한다", async () => {
        const { prisma } = makePrisma({
            id: "u1",
            pinHash: "",
            pinFailedCount: 0,
            pinLockedUntil: null,
        })
        const svc = new PinService(prisma)
        await expect(svc.hash("12345")).rejects.toBeInstanceOf(BadRequestException)
        await expect(svc.hash("abcdef")).rejects.toBeInstanceOf(BadRequestException)
    })

    it("정상 PIN은 해시·검증 성공", async () => {
        const { prisma, users } = makePrisma({
            id: "u1",
            pinHash: "",
            pinFailedCount: 0,
            pinLockedUntil: null,
        })
        const svc = new PinService(prisma)
        const hash = await svc.hash("482913")
        users.get("u1")!.pinHash = hash
        const result = await svc.verify("u1", "482913")
        expect(result.ok).toBe(true)
    })

    it("틀린 PIN은 카운터 증가·남은 횟수 반환", async () => {
        const { prisma, users } = makePrisma({
            id: "u1",
            pinHash: "",
            pinFailedCount: 0,
            pinLockedUntil: null,
        })
        const svc = new PinService(prisma)
        users.get("u1")!.pinHash = await svc.hash("482913")
        const r = await svc.verify("u1", "999988")
        expect(r).toEqual({ ok: false, remainingAttempts: 4 })
        expect(users.get("u1")!.pinFailedCount).toBe(1)
    })

    it("5회 실패 시 잠금되고 423 throw", async () => {
        const { prisma, users } = makePrisma({
            id: "u1",
            pinHash: "",
            pinFailedCount: 4,
            pinLockedUntil: null,
        })
        const svc = new PinService(prisma)
        users.get("u1")!.pinHash = await svc.hash("482913")
        await expect(svc.verify("u1", "999988")).rejects.toBeInstanceOf(
            HttpException,
        )
        expect(users.get("u1")!.pinLockedUntil).toBeTruthy()
    })

    it("잠금 중 검증은 423", async () => {
        const { prisma, users } = makePrisma({
            id: "u1",
            pinHash: "",
            pinFailedCount: 0,
            pinLockedUntil: new Date(Date.now() + 60000),
        })
        const svc = new PinService(prisma)
        users.get("u1")!.pinHash = await svc.hash("482913")
        await expect(svc.verify("u1", "482913")).rejects.toBeInstanceOf(
            HttpException,
        )
    })

    it("resetPin은 해시·카운터·로그를 갱신한다", async () => {
        const { prisma, users, pinResetLog } = makePrisma({
            id: "u1",
            pinHash: "old",
            pinFailedCount: 3,
            pinLockedUntil: new Date(Date.now() + 60000),
        })
        const svc = new PinService(prisma)
        await svc.resetPin("u1", "739204")
        expect(users.get("u1")!.pinFailedCount).toBe(0)
        expect(users.get("u1")!.pinLockedUntil).toBeNull()
        expect(pinResetLog).toHaveLength(1)
    })
})
