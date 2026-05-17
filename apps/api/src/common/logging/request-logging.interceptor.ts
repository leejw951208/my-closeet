// 모든 HTTP 요청을 메서드·경로·처리 시간 기준으로 로깅하는 인터셉터.

import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request } from 'express';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
        this.logger.log(`${request.method} ${request.originalUrl} ${elapsedMs.toFixed(1)}ms`);
      }),
    );
  }
}
