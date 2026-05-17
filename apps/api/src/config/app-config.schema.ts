// 부팅 시점에 환경 변수 형식·필수값을 검증하는 클래스. 누락·오타가 있으면 즉시 부팅을 중단한다.

import { Type, plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum AppEnvironment {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

export class AppConfigSchema {
  @IsEnum(AppEnvironment)
  NODE_ENV: AppEnvironment = AppEnvironment.Development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3000;

  @IsString()
  DATABASE_URL!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  SENTRY_DSN?: string;

  @IsOptional()
  @IsString()
  AMPLITUDE_API_KEY?: string;

  @IsOptional()
  @IsString()
  STORAGE_BUCKET?: string;
}

export function validateAppConfig(raw: Record<string, unknown>): AppConfigSchema {
  const instance = plainToInstance(AppConfigSchema, raw, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(instance, { skipMissingProperties: false });
  if (errors.length > 0) {
    const messages = errors
      .map((error) => `${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`환경 변수 검증 실패\n${messages}`);
  }
  return instance;
}
