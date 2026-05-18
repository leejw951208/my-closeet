// NestJS 애플리케이션 부트스트랩 진입점. 글로벌 검증 파이프와 종료 훅을 활성화한다.

import "reflect-metadata"
import { ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import helmet from "helmet"
import { AppModule } from "./app.module"
import { AppConfigService } from "./config/app-config.service"

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule)
    app.use(
        helmet({
            hsts: {
                maxAge: 31_536_000,
                includeSubDomains: true,
                preload: true,
            },
        }),
    )
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    )
    app.enableShutdownHooks()

    const config = app.get(AppConfigService)
    await app.listen(config.port)
}

void bootstrap()
