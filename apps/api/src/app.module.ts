// 루트 NestJS 모듈. 설정·Prisma·로깅·이벤트·저장소 인프라 모듈을 묶고 헬스 컨트롤러를 노출한다.

import { Module } from "@nestjs/common"
import { AppConfigModule } from "./config/app-config.module"
import { PrismaModule } from "./prisma/prisma.module"
import { LoggingModule } from "./common/logging/logging.module"
import { StorageModule } from "./storage/storage.module"
import { AnalyticsModule } from "./analytics/analytics.module"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"

@Module({
    imports: [
        AppConfigModule,
        PrismaModule,
        LoggingModule,
        StorageModule,
        AnalyticsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
