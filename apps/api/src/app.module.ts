// 루트 NestJS 모듈. 설정·Prisma·로깅·이벤트·저장소 인프라 모듈을 묶고 헬스 컨트롤러를 노출한다.

import { Module } from "@nestjs/common"
import { APP_GUARD } from "@nestjs/core"
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler"
import { AppConfigModule } from "./config/app-config.module"
import { PrismaModule } from "./prisma/prisma.module"
import { LoggingModule } from "./common/logging/logging.module"
import { StorageModule } from "./storage/storage.module"
import { AnalyticsModule } from "./analytics/analytics.module"
import { AuthModule } from "./auth/auth.module"
import { ItemsModule } from "./items/items.module"
import { SmsModule } from "./sms/sms.module"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"

@Module({
    imports: [
        AppConfigModule,
        PrismaModule,
        LoggingModule,
        StorageModule,
        AnalyticsModule,
        SmsModule,
        AuthModule,
        ItemsModule,
        ThrottlerModule.forRoot([
            { name: "default", ttl: 60_000, limit: 60 },
            { name: "otp-send", ttl: 60_000, limit: 5 },
        ]),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
})
export class AppModule {}
