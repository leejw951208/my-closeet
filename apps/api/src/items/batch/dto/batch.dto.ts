// 일괄 등록 라우트 요청 DTO.

import { IsIn, IsInt, IsString, Max, Min } from "class-validator"

const SUPPORTED_CONTENT_TYPES = ["image/jpeg", "image/png"] as const

export class CreateBatchDto {
    @IsInt()
    @Min(1)
    @Max(20)
    count!: number

    @IsString()
    @IsIn(SUPPORTED_CONTENT_TYPES as unknown as string[])
    contentType!: (typeof SUPPORTED_CONTENT_TYPES)[number]
}
