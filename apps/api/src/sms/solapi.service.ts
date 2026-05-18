// 솔라피 SMS 발송 서비스. OTP 6자리 코드를 휴대폰으로 발송한다.
// SMS_DEV_MODE=true 이면 실제 발송 대신 콘솔에 출력한다.

import {
    Injectable,
    Logger,
    OnModuleInit,
    ServiceUnavailableException,
} from "@nestjs/common"
import { SolapiMessageService } from "solapi"
import { AppConfigService } from "../config/app-config.service"

@Injectable()
export class SolapiService implements OnModuleInit {
    private readonly logger = new Logger(SolapiService.name)
    private client: SolapiMessageService | null = null

    constructor(private readonly config: AppConfigService) {}

    onModuleInit(): void {
        if (this.config.smsDevMode) {
            this.logger.warn(
                "SMS_DEV_MODE=true — 실제 SMS 발송을 건너뛰고 콘솔에 코드를 출력합니다.",
            )
            return
        }
        const key = this.config.solapiApiKey
        const secret = this.config.solapiApiSecret
        if (!key || !secret) {
            throw new Error(
                "SMS_DEV_MODE=false 인데 SOLAPI_API_KEY 또는 SOLAPI_API_SECRET 이 설정되지 않았습니다.",
            )
        }
        this.client = new SolapiMessageService(key, secret)
    }

    async sendOtp(phoneNumber: string, code: string): Promise<void> {
        if (this.config.smsDevMode) {
            this.logger.log(`[DEV OTP] ${phoneNumber} → ${code}`)
            return
        }
        const text = `[My Closet] 인증번호는 [${code}] 입니다. 5분 내에 입력해주세요.`
        try {
            await this.client!.send({
                to: phoneNumber,
                from: this.config.solapiSender!,
                text,
            })
        } catch (error) {
            this.logger.error(`솔라피 OTP 발송 실패`, error as Error)
            throw new ServiceUnavailableException({
                code: "sms_send_failed",
                message: "잠시 후 다시 시도해주세요.",
            })
        }
    }
}
