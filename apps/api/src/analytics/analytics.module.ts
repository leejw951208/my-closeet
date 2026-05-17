// 이벤트 분석 모듈. 환경에 따라 sink 구현을 교체한다.

import { Global, Module } from '@nestjs/common';
import { ConsoleAnalyticsSink } from './console-analytics.sink';
import { AnalyticsService } from './analytics.service';
import { ANALYTICS_SINK } from './analytics.types';

@Global()
@Module({
  providers: [
    ConsoleAnalyticsSink,
    {
      provide: ANALYTICS_SINK,
      useExisting: ConsoleAnalyticsSink,
    },
    AnalyticsService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
