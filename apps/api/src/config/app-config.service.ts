// 검증된 환경 변수를 타입 안전하게 노출하는 헬퍼 서비스.

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfigSchema, AppEnvironment } from './app-config.schema';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService<AppConfigSchema, true>) {}

  get nodeEnv(): AppEnvironment {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true });
  }

  get databaseUrl(): string {
    return this.configService.get('DATABASE_URL', { infer: true });
  }

  get sentryDsn(): string | undefined {
    return this.configService.get('SENTRY_DSN', { infer: true });
  }

  get amplitudeApiKey(): string | undefined {
    return this.configService.get('AMPLITUDE_API_KEY', { infer: true });
  }

  get storageBucket(): string | undefined {
    return this.configService.get('STORAGE_BUCKET', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === AppEnvironment.Production;
  }
}
