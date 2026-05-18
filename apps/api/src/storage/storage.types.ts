// 사진 저장소 추상화에 사용되는 공통 타입.

export interface PresignedUploadUrl {
    uploadUrl: string
    publicUrl: string
    objectKey: string
    expiresInSeconds: number
}

export interface ObjectMetadata {
    size: number
    contentType: string | null
}

export interface StorageProvider {
    createPresignedUpload(params: {
        objectKey: string
        contentType: string
    }): Promise<PresignedUploadUrl>
    publicUrl(objectKey: string): string
    headObject(objectKey: string): Promise<ObjectMetadata | null>
    delete(objectKey: string): Promise<void>
}

export const STORAGE_PROVIDER = Symbol("STORAGE_PROVIDER")
