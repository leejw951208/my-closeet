// 검증된 환경 변수를 타입 안전하게 노출하는 헬퍼 서비스.

import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { AppConfigSchema, AppEnvironment } from "./app-config.schema"

@Injectable()
export class AppConfigService {
    constructor(
        private readonly configService: ConfigService<AppConfigSchema, true>,
    ) {}

    get nodeEnv(): AppEnvironment {
        return this.configService.get("NODE_ENV", { infer: true })
    }

    get port(): number {
        return this.configService.get("PORT", { infer: true })
    }

    get databaseUrl(): string {
        return this.configService.get("DATABASE_URL", { infer: true })
    }

    get sentryDsn(): string | undefined {
        return this.configService.get("SENTRY_DSN", { infer: true })
    }

    get amplitudeApiKey(): string | undefined {
        return this.configService.get("AMPLITUDE_API_KEY", { infer: true })
    }

    get storageBucket(): string | undefined {
        return this.configService.get("STORAGE_BUCKET", { infer: true })
    }

    get isProduction(): boolean {
        return this.nodeEnv === AppEnvironment.Production
    }

    get smsDevMode(): boolean {
        return this.configService.get("SMS_DEV_MODE", { infer: true })
    }

    get solapiApiKey(): string | undefined {
        return this.configService.get("SOLAPI_API_KEY", { infer: true })
    }

    get solapiApiSecret(): string | undefined {
        return this.configService.get("SOLAPI_API_SECRET", { infer: true })
    }

    get solapiSender(): string | undefined {
        return this.configService.get("SOLAPI_SENDER", { infer: true })
    }

    get jwtSecret(): string {
        return this.configService.get("JWT_SECRET", { infer: true })
    }

    get jwtAccessTtlMin(): number {
        return this.configService.get("JWT_ACCESS_TTL_MIN", { infer: true })
    }

    get jwtRefreshTtlDays(): number {
        return this.configService.get("JWT_REFRESH_TTL_DAYS", { infer: true })
    }

    get otpSessionTtlMin(): number {
        return this.configService.get("OTP_SESSION_TTL_MIN", { infer: true })
    }
}
