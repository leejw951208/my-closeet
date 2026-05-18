// ItemsRepository 단위 테스트. Closet upsert 멱등성·Item 생성 흐름을 prisma mock으로 검증한다.

import { ItemsRepository } from "./items.repository"
import type { PrismaService } from "../prisma/prisma.service"

function makePrismaWithTransaction() {
    const itemCreate = jest.fn(async ({ data }) => ({
        id: "i1",
        ...data,
        emoji: null,
        brand: null,
        season: null,
        category: data.category ?? null,
        colorHex: data.colorHex ?? null,
        aiConfidence: data.aiConfidence ?? null,
        registeredAt: new Date("2026-05-18T00:00:00Z"),
        deletedAt: null,
    }))
    const closetUpsert = jest.fn(async ({ where }) => ({
        id: `closet-${where.userId}`,
    }))
    const closetFindUnique = jest.fn(async ({ where }) => ({
        id: `closet-${where.userId}`,
    }))
    const closetCreate = jest.fn(async ({ data }) => ({
        id: `closet-${data.userId}`,
    }))

    const tx = {
        closet: { upsert: closetUpsert },
        item: { create: itemCreate },
    }

    const prisma = {
        closet: {
            findUnique: closetFindUnique,
            create: closetCreate,
        },
        $transaction: jest.fn(async (cb: (t: typeof tx) => Promise<unknown>) => cb(tx)),
    }

    return {
        prisma: prisma as unknown as PrismaService,
        mocks: { itemCreate, closetUpsert, closetFindUnique, closetCreate },
    }
}

describe("ItemsRepository", () => {
    describe("ensureCloset", () => {
        it("기존 Closet이 있으면 그대로 반환", async () => {
            const { prisma, mocks } = makePrismaWithTransaction()
            const repo = new ItemsRepository(prisma)
            const closetId = await repo.ensureCloset("u1")
            expect(closetId).toBe("closet-u1")
            expect(mocks.closetCreate).not.toHaveBeenCalled()
        })

        it("Closet이 없으면 신규 생성", async () => {
            const { prisma, mocks } = makePrismaWithTransaction()
            mocks.closetFindUnique.mockResolvedValueOnce(null as never)
            const repo = new ItemsRepository(prisma)
            const closetId = await repo.ensureCloset("u1")
            expect(closetId).toBe("closet-u1")
            expect(mocks.closetCreate).toHaveBeenCalledWith({
                data: { userId: "u1" },
                select: { id: true },
            })
        })
    })

    describe("createItem", () => {
        it("Closet upsert + Item create를 단일 트랜잭션에서 실행", async () => {
            const { prisma, mocks } = makePrismaWithTransaction()
            const repo = new ItemsRepository(prisma)
            const item = await repo.createItem({
                userId: "u1",
                photoUrl: "https://cdn.local/users/u1/items/i1.jpg",
                category: "TOP",
                colorHex: "#fff",
                aiConfidence: 0.9,
            })
            expect(prisma.$transaction).toHaveBeenCalledTimes(1)
            expect(mocks.closetUpsert).toHaveBeenCalledWith({
                where: { userId: "u1" },
                create: { userId: "u1" },
                update: {},
                select: { id: true },
            })
            expect(mocks.itemCreate).toHaveBeenCalledWith({
                data: {
                    closetId: "closet-u1",
                    photoUrl: "https://cdn.local/users/u1/items/i1.jpg",
                    category: "TOP",
                    colorHex: "#fff",
                    aiConfidence: 0.9,
                },
            })
            expect(item.id).toBe("i1")
            expect(item.category).toBe("TOP")
        })

        it("category null도 그대로 저장", async () => {
            const { prisma, mocks } = makePrismaWithTransaction()
            const repo = new ItemsRepository(prisma)
            await repo.createItem({
                userId: "u1",
                photoUrl: "https://cdn.local/users/u1/items/i1.jpg",
                category: null,
                colorHex: null,
                aiConfidence: null,
            })
            const createArgs = mocks.itemCreate.mock.calls[0][0]
            expect(createArgs.data.category).toBeNull()
            expect(createArgs.data.colorHex).toBeNull()
            expect(createArgs.data.aiConfidence).toBeNull()
        })
    })
})
