// Items 라우트 요청 DTO.

import { IsIn, IsInt, IsString, Max, Min, MinLength } from "class-validator"

const SUPPORTED_CONTENT_TYPES = ["image/jpeg", "image/png"] as const

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export class PresignItemDto {
    @IsString()
    @IsIn(SUPPORTED_CONTENT_TYPES as unknown as string[])
    contentType!: (typeof SUPPORTED_CONTENT_TYPES)[number]

    @IsInt()
    @Min(1)
    @Max(MAX_UPLOAD_BYTES)
    contentLength!: number
}

export class CreateItemDto {
    @IsString()
    @MinLength(1)
    objectKey!: string
}
