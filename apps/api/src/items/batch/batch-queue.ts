// 배치 처리 큐 추상화. v1은 in-memory 구현. 인스턴스 분리 시점에 BullMQ 등으로 교체.

import { Injectable, Logger } from "@nestjs/common"

export type BatchJobHandler = (batchId: string) => Promise<void>

export abstract class BatchQueue {
    abstract enqueue(batchId: string): void
    abstract registerHandler(handler: BatchJobHandler): void
    abstract drain(): Promise<void>
}

@Injectable()
export class InMemoryBatchQueue extends BatchQueue {
    private readonly logger = new Logger(InMemoryBatchQueue.name)
    private handler: BatchJobHandler | null = null
    private pending: Promise<void> = Promise.resolve()

    enqueue(batchId: string): void {
        if (!this.handler) {
            throw new Error("BatchQueue handler not registered")
        }
        const handler = this.handler
        this.pending = this.pending
            .catch(() => undefined)
            .then(() =>
                handler(batchId).catch((err) =>
                    this.logger.error(`Batch ${batchId} failed`, err as Error),
                ),
            )
    }

    registerHandler(handler: BatchJobHandler): void {
        this.handler = handler
    }

    async drain(): Promise<void> {
        await this.pending
    }
}
