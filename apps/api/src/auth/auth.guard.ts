// 모든 라우트에 글로벌로 적용되는 가드. @Public 라우트는 통과시키고 그 외는 자체 발급 access JWT를 검증한다.

import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { Request } from "express"
import { JwtService } from "./jwt.service"
import { AuthenticatedRequest } from "./auth.types"
import { IS_PUBLIC_KEY } from "./public.decorator"

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwt: JwtService,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ])
        if (isPublic) {
            return true
        }
        const request = context
            .switchToHttp()
            .getRequest<Request & AuthenticatedRequest>()
        const token = this.extractToken(request)
        if (!token) {
            throw new UnauthorizedException({
                code: "unauthorized",
                message: "Missing Authorization header",
            })
        }
        const payload = this.jwt.verifyAccess(token)
        request.user = { id: payload.sub, phoneNumber: payload.phoneNumber }
        return true
    }

    private extractToken(request: Request): string | null {
        const header = request.headers["authorization"]
        if (!header || typeof header !== "string") return null
        const [scheme, value] = header.split(" ")
        if (scheme?.toLowerCase() !== "bearer" || !value) return null
        return value
    }
}
