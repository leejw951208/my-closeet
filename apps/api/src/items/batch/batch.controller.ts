// 일괄 등록 라우트. 3개 엔드포인트 — 생성·진행률·재시도.

import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Headers,
    Param,
    Post,
} from "@nestjs/common"
import { CurrentUser } from "../../auth/current-user.decorator"
import type { AuthenticatedUser } from "../../auth/auth.types"
import { BatchService } from "./batch.service"
import { CreateBatchDto } from "./dto/batch.dto"

@Controller("items/batch")
export class BatchController {
    constructor(private readonly batch: BatchService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CreateBatchDto,
        @Headers("idempotency-key") idempotencyKey?: string,
    ) {
        return this.batch.createBatch({
            userId: user.id,
            count: dto.count,
            contentType: dto.contentType,
            idempotencyKey: idempotencyKey ?? null,
        })
    }

    @Get(":batchId")
    @HttpCode(HttpStatus.OK)
    getProgress(
        @CurrentUser() user: AuthenticatedUser,
        @Param("batchId") batchId: string,
    ) {
        return this.batch.getProgress(user.id, batchId)
    }

    @Post(":batchId/retry")
    @HttpCode(HttpStatus.OK)
    retry(
        @CurrentUser() user: AuthenticatedUser,
        @Param("batchId") batchId: string,
    ) {
        return this.batch.retry(user.id, batchId)
    }
}
