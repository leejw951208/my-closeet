// 전역 예외 필터. 정의되지 않은 에러를 표준 JSON 형식으로 변환하고, 프로덕션에서는 Sentry로 전달한다.
// Sentry 실제 SDK 연동은 별도 작업으로 남기고 여기서는 후크 위치만 잡는다.

import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from "@nestjs/common"
import type { Request, Response } from "express"
import { AppConfigService } from "../../config/app-config.service"

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger("Exception")

    constructor(private readonly config: AppConfigService) {}

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR
        const message =
            exception instanceof Error ? exception.message : "Unknown error"

        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.originalUrl} → ${status}: ${message}`,
            )
            this.forwardToSentry(exception)
        }

        response.status(status).json({
            statusCode: status,
            path: request.originalUrl,
            message,
            timestamp: new Date().toISOString(),
        })
    }

    private forwardToSentry(error: unknown): void {
        if (!this.config.sentryDsn) {
            return
        }
        // Sentry SDK 연동 후 captureException(error) 호출 위치.
        void error
    }
}
