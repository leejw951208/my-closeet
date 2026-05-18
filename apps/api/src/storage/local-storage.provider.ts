// 로컬 개발용 저장소 구현. 사전서명 URL 대신 API가 직접 받는 업로드 경로를 반환한다.
// 운영 환경에서는 S3·MinIO·R2 같은 실제 객체 스토리지 구현으로 교체한다.

import { Injectable } from "@nestjs/common"
import { randomUUID } from "node:crypto"
import type {
    ObjectMetadata,
    PresignedUploadUrl,
    StorageProvider,
} from "./storage.types"

const PRESIGN_TTL_SECONDS = 3600

@Injectable()
export class LocalStorageProvider implements StorageProvider {
    private readonly baseUrl =
        process.env.LOCAL_STORAGE_BASE_URL ?? "http://localhost:3000/uploads"

    async createPresignedUpload(params: {
        objectKey: string
        contentType: string
    }): Promise<PresignedUploadUrl> {
        const token = randomUUID()
        return {
            objectKey: params.objectKey,
            uploadUrl: `${this.baseUrl}/${params.objectKey}?token=${token}`,
            publicUrl: this.publicUrl(params.objectKey),
            expiresInSeconds: PRESIGN_TTL_SECONDS,
        }
    }

    publicUrl(objectKey: string): string {
        return `${this.baseUrl}/${objectKey}`
    }

    async headObject(_objectKey: string): Promise<ObjectMetadata | null> {
        // 로컬 dev에서는 실제 업로드 검증을 생략하고 항상 존재한다고 가정한다.
        // S3/R2 구현에서는 SDK의 HeadObject로 실제 size·contentType을 조회한다.
        return { size: 0, contentType: null }
    }

    async delete(_objectKey: string): Promise<void> {
        // 로컬 dev에서는 실제 파일 삭제 구현이 필요 시점에 추가한다.
    }
}
