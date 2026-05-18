// BatchService 단위 테스트. 생성·진행률·재시도·process 흐름.

import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from "@nestjs/common"
import { BatchService } from "./batch.service"
import type { BatchQueue } from "./batch-queue"
import type { BatchRepository, BatchWithItems } from "./batch.repository"
import type { ClassifierService } from "../classifier.service"
import type { ItemsRepository } from "../items.repository"
import type { StorageProvider } from "../../storage/storage.types"
import type { ItemBatchItem } from "@my-closet/database"

function makeStorage(): jest.Mocked<StorageProvider> {
    return {
        createPresignedUpload: jest.fn(async ({ objectKey }: { objectKey: string }) => ({
            objectKey,
            uploadUrl: `https://storage.local/${objectKey}?sig=x`,
            publicUrl: `https://cdn.local/${objectKey}`,
            expiresInSeconds: 3600,
        })),
        publicUrl: jest.fn((k: string) => `https://cdn.local/${k}`),
        headObject: jest.fn(async (_k: string) => ({
            size: 1024,
            contentType: "image/jpeg" as string | null,
        })),
        delete: jest.fn(async (_k: string) => undefined),
    } as unknown as jest.Mocked<StorageProvider>
}

function makeClassifier(): ClassifierService & { classify: jest.Mock } {
    return {
        classify: jest.fn(async () => ({ category: null, colorHex: null, confidence: null })),
    } as unknown as ClassifierService & { classify: jest.Mock }
}

function makeItemsRepo(): jest.Mocked<ItemsRepository> {
    return {
        ensureCloset: jest.fn(async () => "c1"),
        createItem: jest.fn(async () => ({
            id: `item-${Math.random().toString(36).slice(2, 8)}`,
            closetId: "c1",
            photoUrl: "",
            category: null,
            emoji: null,
            colorHex: null,
            brand: null,
            season: null,
            aiConfidence: null,
            registeredAt: new Date(),
            deletedAt: null,
        })),
    } as unknown as jest.Mocked<ItemsRepository>
}

function makeBatchRepo() {
    const state = new Map<string, BatchWithItems>()
    let counter = 0
    const repo = {
        findByIdempotencyKey: jest.fn(async (userId: string, key: string) => {
            for (const b of state.values()) {
                if (b.userId === userId && b.idempotencyKey === key) return b
            }
            return null
        }),
        findActiveByUser: jest.fn(async (userId: string) => {
            for (const b of state.values()) {
                if (b.userId === userId && (b.status === "PENDING" || b.status === "PROCESSING"))
                    return b
            }
            return null
        }),
        findById: jest.fn(async (id: string) => state.get(id) ?? null),
        create: jest.fn(
            async ({
                userId,
                idempotencyKey,
                items,
            }: {
                userId: string
                idempotencyKey: string | null
                items: { objectKey: string }[]
            }) => {
                counter++
                const id = `batch-${counter}`
                const batch: BatchWithItems = {
                    id,
                    userId,
                    idempotencyKey,
                    total: items.length,
                    completed: 0,
                    failed: 0,
                    status: "PENDING",
                    createdAt: new Date(),
                    completedAt: null,
                    items: items.map((it, i) => ({
                        id: `${id}-item-${i}`,
                        batchId: id,
                        objectKey: it.objectKey,
                        status: "PENDING",
                        itemId: null,
                        error: null,
                        updatedAt: new Date(),
                    })) as ItemBatchItem[],
                }
                state.set(id, batch)
                return batch
            },
        ),
        markBatchStatus: jest.fn(async (id, status, completedAt?: Date) => {
            const b = state.get(id)
            if (!b) return
            b.status = status
            b.completedAt = completedAt ?? null
        }),
        markItemResult: jest.fn(async (itemId, status, result) => {
            for (const b of state.values()) {
                const item = b.items.find((i) => i.id === itemId)
                if (!item) continue
                item.status = status
                item.itemId = result.itemId ?? null
                item.error = result.error ?? null
                if (status === "COMPLETED") b.completed += 1
                if (status === "FAILED") b.failed += 1
            }
        }),
        resetItemsForRetry: jest.fn(async (batchId: string) => {
            const b = state.get(batchId)
            if (!b) return []
            const failed = b.items.filter((i) => i.status === "FAILED")
            for (const it of failed) {
                it.status = "PENDING"
                it.error = null
            }
            b.failed = Math.max(0, b.failed - failed.length)
            b.status = "PROCESSING"
            b.completedAt = null
            return failed
        }),
    }
    return { repo: repo as unknown as jest.Mocked<BatchRepository>, state }
}

function makeQueue() {
    let handler: ((id: string) => Promise<void>) | null = null
    const enqueued: string[] = []
    return {
        queue: {
            enqueue: jest.fn((id: string) => {
                enqueued.push(id)
            }),
            registerHandler: jest.fn((h) => {
                handler = h
            }),
            drain: jest.fn(async () => undefined),
        } as unknown as BatchQueue,
        getHandler: () => handler,
        enqueued,
    }
}

describe("BatchService", () => {
    describe("createBatch", () => {
        it("정상 생성 시 ItemBatch row + presign N개 + 큐 enqueue", async () => {
            const { repo: batchRepo, state } = makeBatchRepo()
            const { queue, enqueued } = makeQueue()
            const service = new BatchService(
                makeStorage(),
                makeClassifier(),
                makeItemsRepo(),
                batchRepo,
                queue,
            )
            const result = await service.createBatch({
                userId: "u1",
                count: 3,
                contentType: "image/jpeg",
                idempotencyKey: null,
            })
            expect(result.items).toHaveLength(3)
            expect(enqueued).toEqual([result.batchId])
            expect(state.get(result.batchId)?.total).toBe(3)
        })

        it("count 21이면 400", async () => {
            const { repo: batchRepo } = makeBatchRepo()
            const { queue } = makeQueue()
            const service = new BatchService(
                makeStorage(),
                makeClassifier(),
                makeItemsRepo(),
                batchRepo,
                queue,
            )
            await expect(
                service.createBatch({
                    userId: "u1",
                    count: 21,
                    contentType: "image/jpeg",
                    idempotencyKey: null,
                }),
            ).rejects.toBeInstanceOf(BadRequestException)
        })

        it("동일 idempotency-key 재호출은 첫 응답 반환·신규 row 미생성", async () => {
            const { repo: batchRepo } = makeBatchRepo()
            const { queue, enqueued } = makeQueue()
            const service = new BatchService(
                makeStorage(),
                makeClassifier(),
                makeItemsRepo(),
                batchRepo,
                queue,
            )
            const first = await service.createBatch({
                userId: "u1",
                count: 2,
                contentType: "image/jpeg",
                idempotencyKey: "key-1",
            })
            const second = await service.createBatch({
                userId: "u1",
                count: 2,
                contentType: "image/jpeg",
                idempotencyKey: "key-1",
            })
            expect(second.batchId).toBe(first.batchId)
            expect(enqueued).toEqual([first.batchId])
            expect(batchRepo.create).toHaveBeenCalledTimes(1)
        })

        it("활성 배치가 있고 idempotency 미일치면 409", async () => {
            const { repo: batchRepo } = makeBatchRepo()
            const { queue } = makeQueue()
            const service = new BatchService(
                makeStorage(),
                makeClassifier(),
                makeItemsRepo(),
                batchRepo,
                queue,
            )
            await service.createBatch({
                userId: "u1",
                count: 1,
                contentType: "image/jpeg",
                idempotencyKey: null,
            })
            await expect(
                service.createBatch({
                    userId: "u1",
                    count: 1,
                    contentType: "image/jpeg",
                    idempotencyKey: null,
                }),
            ).rejects.toBeInstanceOf(ConflictException)
        })
    })

    describe("getProgress", () => {
        it("타 사용자 batchId는 404", async () => {
            const { repo: batchRepo } = makeBatchRepo()
            const { queue } = makeQueue()
            const service = new BatchService(
                makeStorage(),
                makeClassifier(),
                makeItemsRepo(),
                batchRepo,
                queue,
            )
            const created = await service.createBatch({
                userId: "u1",
                count: 1,
                contentType: "image/jpeg",
                idempotencyKey: null,
            })
            await expect(
                service.getProgress("u2", created.batchId),
            ).rejects.toBeInstanceOf(NotFoundException)
        })
    })

    describe("process", () => {
        it("정상 처리 시 모든 항목 COMPLETED + 배치 COMPLETED", async () => {
            const { repo: batchRepo, state } = makeBatchRepo()
            const { queue, getHandler, enqueued } = makeQueue()
            const service = new BatchService(
                makeStorage(),
                makeClassifier(),
                makeItemsRepo(),
                batchRepo,
                queue,
            )
            service.onModuleInit()
            expect(getHandler()).not.toBeNull()
            const created = await service.createBatch({
                userId: "u1",
                count: 2,
                contentType: "image/jpeg",
                idempotencyKey: null,
            })
            await service.process(enqueued[0])
            const final = state.get(created.batchId)
            expect(final?.status).toBe("COMPLETED")
            expect(final?.completed).toBe(2)
            expect(final?.failed).toBe(0)
        })

        it("headObject null인 항목은 FAILED, 배치 PROCESSING/FAILED", async () => {
            const storage = makeStorage()
            storage.headObject.mockResolvedValueOnce(null)
            storage.headObject.mockResolvedValueOnce({
                size: 1,
                contentType: "image/jpeg",
            })
            const { repo: batchRepo, state } = makeBatchRepo()
            const { queue } = makeQueue()
            const service = new BatchService(
                storage,
                makeClassifier(),
                makeItemsRepo(),
                batchRepo,
                queue,
            )
            const created = await service.createBatch({
                userId: "u1",
                count: 2,
                contentType: "image/jpeg",
                idempotencyKey: null,
            })
            await service.process(created.batchId)
            const final = state.get(created.batchId)
            expect(final?.completed).toBe(1)
            expect(final?.failed).toBe(1)
            expect(final?.status).toBe("COMPLETED")
        })
    })

    describe("retry", () => {
        it("FAILED 항목을 PENDING 복귀시키고 큐 재enqueue", async () => {
            const storage = makeStorage()
            storage.headObject.mockResolvedValueOnce(null)
            storage.headObject.mockResolvedValueOnce({
                size: 1,
                contentType: "image/jpeg",
            })
            const { repo: batchRepo, state } = makeBatchRepo()
            const { queue, enqueued } = makeQueue()
            const service = new BatchService(
                storage,
                makeClassifier(),
                makeItemsRepo(),
                batchRepo,
                queue,
            )
            const created = await service.createBatch({
                userId: "u1",
                count: 2,
                contentType: "image/jpeg",
                idempotencyKey: null,
            })
            await service.process(created.batchId)
            expect(state.get(created.batchId)?.failed).toBe(1)
            await service.retry("u1", created.batchId)
            expect(enqueued.length).toBe(2)
            expect(state.get(created.batchId)?.failed).toBe(0)
        })
    })
})
