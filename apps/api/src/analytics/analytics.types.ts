// 이벤트 로깅 공통 타입. metrics-dashboard.md의 이벤트 카탈로그를 코드로 옮긴다.

export type AnalyticsEventName =
  | 'sign_up'
  | 'item_register'
  | 'item_category_correct'
  | 'item_delete'
  | 'wardrobe_view_open'
  | 'wardrobe_view_toggle'
  | 'outfit_board_open'
  | 'outfit_shuffle'
  | 'outfit_save'
  | 'outfit_wear'
  | 'outfit_share'
  | 'outfit_delete'
  | 'calendar_view_open'
  | 'app_open'
  | 'app_close';

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  userId?: string;
  deviceId?: string;
  properties?: Record<string, unknown>;
  occurredAt?: Date;
}

export interface AnalyticsSink {
  track(event: AnalyticsEvent): Promise<void>;
}

export const ANALYTICS_SINK = Symbol('ANALYTICS_SINK');
