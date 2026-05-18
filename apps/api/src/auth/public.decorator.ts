// @Public() 데코레이터로 표시된 라우트는 AuthGuard가 토큰 검증을 건너뛴다.

import { SetMetadata } from "@nestjs/common"

export const IS_PUBLIC_KEY = "auth:isPublic"
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
