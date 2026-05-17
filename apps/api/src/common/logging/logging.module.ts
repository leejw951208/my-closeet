// 글로벌 로깅·예외 처리 모듈. APP_INTERCEPTOR·APP_FILTER 토큰으로 자동 등록한다.

import { Module } from "@nestjs/common"
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core"
import { GlobalExceptionFilter } from "./global-exception.filter"
import { RequestLoggingInterceptor } from "./request-logging.interceptor"

@Module({
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: RequestLoggingInterceptor,
        },
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
    ],
})
export class LoggingModule {}
