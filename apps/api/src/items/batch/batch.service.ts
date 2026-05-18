// 일괄 등록 도메인 서비스. 생성·진행률 조회·재시도와 큐 결선을 담당한다.

import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit,
} from "@nestjs/common"
import { randomUUID } from "node:crypto"
import type {
    PresignedUploadUrl,
    StorageProvider,
} from "../../storage/storage.types"
import { STORAGE_PROVIDER } from "../../storage/storage.types"
import { ClassifierService } from "../classifier.service"
import { ItemsRepository } from "../items.repository"
import { buildItemObjectKey } from "../object-key"
import { BatchQueue } from "./batch-queue"
import { BatchRepository } from "./batch.repository"

const MAX_BATCH_SIZE = 20

export interface BatchCreatedView {
    batchId: string
    items: { itemBatchItemId: string; uploadUrl: string; objectKey: string }[]
}

export interface BatchProgressView {
    batchId: string
    total: number
    completed: number
    failed: number
    status: string
    items: {
        itemBatchItemId: string
        status: string
        itemId: string | null
        error: string | null
    }[]
}

@Injectable()
export class BatchService implements OnModuleInit {
    constructor(
        @Inject(STORAGE_PROVIDER)
        private readonly storage: StorageProvider,
        private readonly classifier: ClassifierService,
        private readonly itemsRepo: ItemsRepository,
        private readonly batchRepo: BatchRepository,
        private readonly queue: BatchQueue,
    ) {}

    onModuleInit(): void {
        this.queue.registerHandler((batchId) => this.process(batchId))
    }

    async createBatch(params: {
        userId: string
        count: number
        contentType: string
        idempotencyKey: string | null
    }): Promise<BatchCreatedView> {
        if (params.count < 1 || params.count > MAX_BATCH_SIZE) {
            throw new BadRequestException({
                code: "invalid_batch_size",
                message: `count must be between 1 and ${MAX_BATCH_SIZE}`,
            })
        }

        if (params.idempotencyKey) {
            const existing = await this.batchRepo.findByIdempotencyKey(
                params.userId,
                params.idempotencyKey,
            )
            if (existing) return this.toCreatedView(existing.id, existing.items, params)
        }

        const active = await this.batchRepo.findActiveByUser(params.userId)
        if (active) {
            throw new ConflictException({
                code: "batch_in_progress",
                message: "Another batch is already in progress",
                batchId: active.id,
            })
        }

        const itemsToCreate = Array.from({ length: params.count }, () => {
            const itemId = randomUUID()
            return {
                objectKey: buildItemObjectKey({
                    userId: params.userId,
                    itemId,
                    contentType: params.contentType,
                }),
            }
        })

        const batch = await this.batchRepo.create({
            userId: params.userId,
            idempotencyKey: params.idempotencyKey,
            items: itemsToCreate,
        })

        const view = await this.toCreatedView(batch.id, batch.items, params)
        this.queue.enqueue(batch.id)
        return view
    }

    async getProgress(
        userId: string,
        batchId: string,
    ): Promise<BatchProgressView> {
        const batch = await this.batchRepo.findById(batchId)
        if (!batch || batch.userId !== userId) {
            throw new NotFoundException({
                code: "batch_not_found",
                message: "Batch not found",
            })
        }
        return {
            batchId: batch.id,
            total: batch.total,
            completed: batch.completed,
            failed: batch.failed,
            status: batch.status,
            items: batch.items.map((it) => ({
                itemBatchItemId: it.id,
                status: it.status,
                itemId: it.itemId,
                error: it.error,
            })),
        }
    }

    async retry(userId: string, batchId: string): Promise<BatchProgressView> {
        const batch = await this.batchRepo.findById(batchId)
        if (!batch || batch.userId !== userId) {
            throw new NotFoundException({
                code: "batch_not_found",
                message: "Batch not found",
            })
        }
        const failed = await this.batchRepo.resetItemsForRetry(batchId)
        if (failed.length > 0) {
            this.queue.enqueue(batchId)
        }
        return this.getProgress(userId, batchId)
    }

    async process(batchId: string): Promise<void> {
        const batch = await this.batchRepo.findById(batchId)
        if (!batch) return

        await this.batchRepo.markBatchStatus(batchId, "PROCESSING")

        for (const item of batch.items) {
            if (item.status !== "PENDING") continue
            try {
                const metadata = await this.storage.headObject(item.objectKey)
                if (!metadata) {
                    await this.batchRepo.markItemResult(item.id, "FAILED", {
                        error: "object_not_found",
                    })
                    continue
                }
                const classification = await this.classifier.classify(item.objectKey)
                const created = await this.itemsRepo.createItem({
                    userId: batch.userId,
                    photoUrl: this.storage.publicUrl(item.objectKey),
                    category: classification.category,
                    colorHex: classification.colorHex,
                    aiConfidence: classification.confidence,
                })
                await this.batchRepo.markItemResult(item.id, "COMPLETED", {
                    itemId: created.id,
                })
            } catch (err) {
                await this.batchRepo.markItemResult(item.id, "FAILED", {
                    error: err instanceof Error ? err.message : "unknown_error",
                })
            }
        }

        const final = await this.batchRepo.findById(batchId)
        if (!final) return
        const status =
            final.failed > 0 && final.completed === 0
                ? "FAILED"
                : final.completed + final.failed === final.total
                  ? "COMPLETED"
                  : "PROCESSING"
        await this.batchRepo.markBatchStatus(
            batchId,
            status,
            status === "COMPLETED" || status === "FAILED" ? new Date() : undefined,
        )
    }

    private async toCreatedView(
        batchId: string,
        items: { id: string; objectKey: string }[],
        params: { contentType: string },
    ): Promise<BatchCreatedView> {
        const presigned = await Promise.all(
            items.map(async (it) => {
                const url: PresignedUploadUrl =
                    await this.storage.createPresignedUpload({
                        objectKey: it.objectKey,
                        contentType: params.contentType,
                    })
                return {
                    itemBatchItemId: it.id,
                    uploadUrl: url.uploadUrl,
                    objectKey: url.objectKey,
                }
            }),
        )
        return { batchId, items: presigned }
    }
}
