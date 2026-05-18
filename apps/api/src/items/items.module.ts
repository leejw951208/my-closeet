// Items 모듈. 단건 등록 + 일괄 등록 + 분류 어댑터. P2까지 ClassifierService는 NullClassifier.

import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module"
import { ItemsController } from "./items.controller"
import { ItemsService } from "./items.service"
import { ItemsRepository } from "./items.repository"
import { ClassifierService, NullClassifier } from "./classifier.service"
import { BatchController } from "./batch/batch.controller"
import { BatchService } from "./batch/batch.service"
import { BatchRepository } from "./batch/batch.repository"
import { BatchQueue, InMemoryBatchQueue } from "./batch/batch-queue"

@Module({
    imports: [PrismaModule],
    controllers: [ItemsController, BatchController],
    providers: [
        ItemsService,
        ItemsRepository,
        BatchService,
        BatchRepository,
        { provide: ClassifierService, useClass: NullClassifier },
        { provide: BatchQueue, useClass: InMemoryBatchQueue },
    ],
    exports: [ItemsService],
})
export class ItemsModule {}
