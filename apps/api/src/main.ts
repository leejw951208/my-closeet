// NestJS 애플리케이션 부트스트랩 진입점. 포트는 환경 변수 PORT 또는 기본값 3000을 사용한다.

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

void bootstrap();
