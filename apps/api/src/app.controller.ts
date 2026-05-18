// 헬스 체크용 루트 컨트롤러.

import { Controller, Get } from "@nestjs/common"
import { Public } from "./auth/public.decorator"
import { AppService } from "./app.service"

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Public()
    @Get()
    health(): { status: string } {
        return this.appService.health()
    }
}
