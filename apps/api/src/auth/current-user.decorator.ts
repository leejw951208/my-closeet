// 컨트롤러 메서드에서 AuthGuard가 부착한 user 컨텍스트를 받기 위한 데코레이터.

import { ExecutionContext, createParamDecorator } from "@nestjs/common"
import { AuthenticatedRequest, AuthenticatedUser } from "./auth.types"

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
        const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
        return request.user
    },
)
