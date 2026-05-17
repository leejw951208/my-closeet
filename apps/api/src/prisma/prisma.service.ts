// NestJS Prisma 레시피에 Prisma 7의 driver adapter 패턴을 결합한 서비스.
// v7부터 PrismaClient는 adapter를 통해서만 데이터베이스에 접속한다.

import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@my-closet/database"
import { AppConfigService } from "../config/app-config.service"

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor(config: AppConfigService) {
        super({
            adapter: new PrismaPg({ connectionString: config.databaseUrl }),
        })
    }

    async onModuleInit(): Promise<void> {
        await this.$connect()
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect()
    }
}
