// 기본 이벤트 인터페이스
export const URL_VERIFICATION = 'url_verification';
export const MESSAGE = 'message';
export const EVENT_CALLBACK = 'event_callback';

interface SlackEventBase {
  token: string;
  type: string;
}

// URL 검증용 이벤트
interface SlackUrlVerificationEvent extends SlackEventBase {
  type: typeof URL_VERIFICATION;
  challenge: string;
}

// 메시지 이벤트 상세 정보
interface SlackMessageEvent {
  type: typeof MESSAGE;
  channel: string;
  user: string;
  text: string;
  ts: string;
  event_ts: string;
  channel_type: string;
}

// 일반 메시지 이벤트
interface SlackEventCallback extends SlackEventBase {
  type: typeof EVENT_CALLBACK | typeof URL_VERIFICATION;
  team_id?: string;
  api_app_id?: string;
  event?: SlackMessageEvent;
  authed_teams?: string[];
  event_id?: string;
  event_time?: number;
  challenge?: string;
}

// 모든 이벤트 타입을 하나로 통합
export type SlackWebhookEvent = SlackUrlVerificationEvent | SlackEventCallback;

// 타입 가드 함수
export const isUrlVerificationEvent = (
  event: SlackWebhookEvent,
): event is SlackUrlVerificationEvent => {
  return event.type === URL_VERIFICATION;
};
