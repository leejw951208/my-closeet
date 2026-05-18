// AuthGuard 단위 테스트. @Public 통과, Bearer 누락 401, 유효 토큰 user 부착.

import { ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { AuthGuard } from "./auth.guard"
import { JwtService } from "./jwt.service"

function ctx(headers: Record<string, string | undefined>, request: Record<string, unknown> = {}): ExecutionContext {
    return {
        switchToHttp: () => ({
            getRequest: () => ({ headers, ...request }),
        }),
        getHandler: () => () => undefined,
        getClass: () => class {},
    } as unknown as ExecutionContext
}

describe("AuthGuard", () => {
    it("@Public 라우트는 통과", () => {
        const reflector = { getAllAndOverride: () => true } as unknown as Reflector
        const jwt = { verifyAccess: jest.fn() } as unknown as JwtService
        const guard = new AuthGuard(reflector, jwt)
        expect(guard.canActivate(ctx({}))).toBe(true)
    })

    it("Authorization 헤더 누락은 401", () => {
        const reflector = { getAllAndOverride: () => false } as unknown as Reflector
        const jwt = { verifyAccess: jest.fn() } as unknown as JwtService
        const guard = new AuthGuard(reflector, jwt)
        expect(() => guard.canActivate(ctx({}))).toThrow(UnauthorizedException)
    })

    it("Bearer 형식 아님은 401", () => {
        const reflector = { getAllAndOverride: () => false } as unknown as Reflector
        const jwt = { verifyAccess: jest.fn() } as unknown as JwtService
        const guard = new AuthGuard(reflector, jwt)
        expect(() =>
            guard.canActivate(ctx({ authorization: "Basic abc" })),
        ).toThrow(UnauthorizedException)
    })

    it("유효 토큰은 request.user 부착", () => {
        const reflector = { getAllAndOverride: () => false } as unknown as Reflector
        const jwt = {
            verifyAccess: jest.fn(() => ({ sub: "u1", phoneNumber: "+821011112222" })),
        } as unknown as JwtService
        const guard = new AuthGuard(reflector, jwt)
        const req: Record<string, unknown> = {}
        const c = ctx({ authorization: "Bearer xyz" }, req)
        ;(c.switchToHttp as jest.Mock) =
            (() => ({ getRequest: () => req })) as unknown as jest.Mock
        // ctx already returned headers in the inline request; rebuild a guard-compatible mock
        const fixed = {
            switchToHttp: () => ({
                getRequest: () =>
                    Object.assign(req, { headers: { authorization: "Bearer xyz" } }),
            }),
            getHandler: () => () => undefined,
            getClass: () => class {},
        } as unknown as ExecutionContext
        expect(guard.canActivate(fixed)).toBe(true)
        expect((req as { user?: unknown }).user).toEqual({
            id: "u1",
            phoneNumber: "+821011112222",
        })
    })
})
