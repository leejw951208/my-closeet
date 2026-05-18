// Items 라우트. 사전서명·단건 등록 2개 엔드포인트. JWT 인증 필수.

import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common"
import { CurrentUser } from "../auth/current-user.decorator"
import type { AuthenticatedUser } from "../auth/auth.types"
import { ItemsService } from "./items.service"
import { CreateItemDto, PresignItemDto } from "./dto/items.dto"

@Controller("items")
export class ItemsController {
    constructor(private readonly items: ItemsService) {}

    @Post("presign")
    @HttpCode(HttpStatus.OK)
    presign(@CurrentUser() user: AuthenticatedUser, @Body() dto: PresignItemDto) {
        return this.items.presign({
            userId: user.id,
            contentType: dto.contentType,
            contentLength: dto.contentLength,
        })
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateItemDto) {
        return this.items.create({ userId: user.id, objectKey: dto.objectKey })
    }
}
