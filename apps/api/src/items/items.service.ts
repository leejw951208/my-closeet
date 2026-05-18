// Item 도메인 서비스. 사전서명 발급과 단건 등록 흐름을 조립한다.

import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
    PayloadTooLargeException,
} from "@nestjs/common"
import { randomUUID } from "node:crypto"
import type { ItemCategory } from "@my-closet/database"
import type { PresignedUploadUrl, StorageProvider } from "../storage/storage.types"
import { STORAGE_PROVIDER } from "../storage/storage.types"
import { ClassifierService } from "./classifier.service"
import { ItemsRepository } from "./items.repository"
import { buildItemObjectKey, isSupportedContentType } from "./object-key"

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10MB

export interface CreatedItemView {
    id: string
    category: ItemCategory | null
    colorHex: string | null
    photoUrl: string
    aiConfidence: number | null
    registeredAt: Date
}

@Injectable()
export class ItemsService {
    constructor(
        @Inject(STORAGE_PROVIDER)
        private readonly storage: StorageProvider,
        private readonly classifier: ClassifierService,
        private readonly repo: ItemsRepository,
    ) {}

    async presign(params: {
        userId: string
        contentType: string
        contentLength: number
    }): Promise<PresignedUploadUrl> {
        if (!isSupportedContentType(params.contentType)) {
            throw new BadRequestException({
                code: "unsupported_content_type",
                message: `Unsupported contentType: ${params.contentType}`,
            })
        }
        if (params.contentLength > MAX_UPLOAD_BYTES) {
            throw new PayloadTooLargeException({
                code: "payload_too_large",
                message: `contentLength exceeds ${MAX_UPLOAD_BYTES} bytes`,
            })
        }
        const itemId = randomUUID()
        const objectKey = buildItemObjectKey({
            userId: params.userId,
            itemId,
            contentType: params.contentType,
        })
        return this.storage.createPresignedUpload({
            objectKey,
            contentType: params.contentType,
        })
    }

    async create(params: {
        userId: string
        objectKey: string
    }): Promise<CreatedItemView> {
        this.assertOwnsObjectKey(params.userId, params.objectKey)
        const metadata = await this.storage.headObject(params.objectKey)
        if (!metadata) {
            throw new NotFoundException({
                code: "object_not_found",
                message: "objectKey has not been uploaded yet",
            })
        }
        if (metadata.size > MAX_UPLOAD_BYTES) {
            throw new PayloadTooLargeException({
                code: "payload_too_large",
                message: `uploaded object exceeds ${MAX_UPLOAD_BYTES} bytes`,
            })
        }
        const classification = await this.classifier.classify(params.objectKey)
        const photoUrl = this.storage.publicUrl(params.objectKey)
        const item = await this.repo.createItem({
            userId: params.userId,
            photoUrl,
            category: classification.category as ItemCategory | null,
            colorHex: classification.colorHex,
            aiConfidence: classification.confidence,
        })
        return {
            id: item.id,
            category: item.category ?? null,
            colorHex: item.colorHex,
            photoUrl: item.photoUrl,
            aiConfidence: item.aiConfidence,
            registeredAt: item.registeredAt,
        }
    }

    private assertOwnsObjectKey(userId: string, objectKey: string): void {
        const prefix = `users/${userId}/items/`
        if (!objectKey.startsWith(prefix)) {
            throw new BadRequestException({
                code: "object_key_not_owned",
                message: "objectKey does not belong to the current user",
            })
        }
    }
}
