// SMS 발송 모듈. 솔라피 어댑터를 노출한다.

import { Module } from "@nestjs/common"
import { AppConfigModule } from "../config/app-config.module"
import { SolapiService } from "./solapi.service"

@Module({
    imports: [AppConfigModule],
    providers: [SolapiService],
    exports: [SolapiService],
})
export class SmsModule {}
