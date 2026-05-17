// 도메인 코드에서 호출하는 단일 진입점. sink 구현을 직접 노출하지 않고 한 단계 감싼다.

import { Inject, Injectable } from '@nestjs/common';
import { ANALYTICS_SINK, type AnalyticsEvent, type AnalyticsSink } from './analytics.types';

@Injectable()
export class AnalyticsService {
  constructor(@Inject(ANALYTICS_SINK) private readonly sink: AnalyticsSink) {}

  async track(event: AnalyticsEvent): Promise<void> {
    await this.sink.track({ occurredAt: new Date(), ...event });
  }
}
