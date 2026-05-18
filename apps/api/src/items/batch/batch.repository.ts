// ItemBatch·ItemBatchItem 영속화. idempotency 조회와 진행률 조회를 다룬다.

import { Injectable } from "@nestjs/common"
import type {
    ItemBatch,
    ItemBatchItem,
    ItemBatchItemStatus,
    ItemBatchStatus,
} from "@my-closet/database"
import { PrismaService } from "../../prisma/prisma.service"

export interface CreateBatchInput {
    userId: string
    idempotencyKey: string | null
    items: { objectKey: string }[]
}

export interface BatchWithItems extends ItemBatch {
    items: ItemBatchItem[]
}

@Injectable()
export class BatchRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findByIdempotencyKey(
        userId: string,
        key: string,
    ): Promise<BatchWithItems | null> {
        return this.prisma.itemBatch.findUnique({
            where: { userId_idempotencyKey: { userId, idempotencyKey: key } },
            include: { items: true },
        })
    }

    async findActiveByUser(userId: string): Promise<ItemBatch | null> {
        return this.prisma.itemBatch.findFirst({
            where: {
                userId,
                status: { in: ["PENDING", "PROCESSING"] },
            },
        })
    }

    async findById(batchId: string): Promise<BatchWithItems | null> {
        return this.prisma.itemBatch.findUnique({
            where: { id: batchId },
            include: { items: true },
        })
    }

    async create(input: CreateBatchInput): Promise<BatchWithItems> {
        return this.prisma.itemBatch.create({
            data: {
                userId: input.userId,
                idempotencyKey: input.idempotencyKey,
                total: input.items.length,
                items: { create: input.items.map((it) => ({ objectKey: it.objectKey })) },
            },
            include: { items: true },
        })
    }

    async markBatchStatus(
        batchId: string,
        status: ItemBatchStatus,
        completedAt?: Date,
    ): Promise<void> {
        await this.prisma.itemBatch.update({
            where: { id: batchId },
            data: { status, completedAt: completedAt ?? null },
        })
    }

    async markItemResult(
        itemBatchItemId: string,
        status: ItemBatchItemStatus,
        result: { itemId?: string; error?: string },
    ): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            const item = await tx.itemBatchItem.update({
                where: { id: itemBatchItemId },
                data: {
                    status,
                    itemId: result.itemId ?? null,
                    error: result.error ?? null,
                },
            })
            if (status === "COMPLETED") {
                await tx.itemBatch.update({
                    where: { id: item.batchId },
                    data: { completed: { increment: 1 } },
                })
            } else if (status === "FAILED") {
                await tx.itemBatch.update({
                    where: { id: item.batchId },
                    data: { failed: { increment: 1 } },
                })
            }
        })
    }

    async resetItemsForRetry(batchId: string): Promise<ItemBatchItem[]> {
        const failed = await this.prisma.itemBatchItem.findMany({
            where: { batchId, status: "FAILED" },
        })
        if (failed.length === 0) return []
        await this.prisma.$transaction([
            this.prisma.itemBatchItem.updateMany({
                where: { batchId, status: "FAILED" },
                data: { status: "PENDING", error: null },
            }),
            this.prisma.itemBatch.update({
                where: { id: batchId },
                data: {
                    status: "PROCESSING",
                    failed: { decrement: failed.length },
                    completedAt: null,
                },
            }),
        ])
        return failed
    }
}
