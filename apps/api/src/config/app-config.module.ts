// 전역 Config 모듈. .env 로드 + 부팅 시 환경 변수 검증을 함께 수행한다.

import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateAppConfig } from './app-config.schema';
import { AppConfigService } from './app-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateAppConfig,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
