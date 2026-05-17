// 로컬 dev용 sink. 이벤트를 콘솔에 출력한다. 운영에서는 Amplitude/Mixpanel/BigQuery로 교체한다.

import { Injectable, Logger } from '@nestjs/common';
import type { AnalyticsEvent, AnalyticsSink } from './analytics.types';

@Injectable()
export class ConsoleAnalyticsSink implements AnalyticsSink {
  private readonly logger = new Logger('Analytics');

  async track(event: AnalyticsEvent): Promise<void> {
    this.logger.log(
      `[${event.name}] user=${event.userId ?? '-'} props=${JSON.stringify(event.properties ?? {})}`,
    );
  }
}
