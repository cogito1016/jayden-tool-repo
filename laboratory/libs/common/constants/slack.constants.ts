/**
 * Slack 관련 상수 정의
 */

// 리마인더 봇 ID
export const REMINDER_BOT_ID = process.env.REMINDER_BOT_ID;

// 슬랙 이벤트 타입
export const SLACK_EVENT_TYPES = {
  URL_VERIFICATION: 'url_verification',
  EVENT_CALLBACK: 'event_callback',
  MESSAGE: 'message',
};

// 멘션 패턴 정규식
export const MENTION_PATTERN = /<@([A-Z0-9]+)>/g;

// 채널 타입
export const CHANNEL_TYPES = {
  CHANNEL: 'channel',
  GROUP: 'group',
  IM: 'im', // 개인 메시지
  MPIM: 'mpim', // 다중 개인 메시지
};
