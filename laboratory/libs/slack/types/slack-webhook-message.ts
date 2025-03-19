// 기본 이벤트 인터페이스
export const URL_VERIFICATION = 'url_verification';
export const MESSAGE = 'message';
export const EVENT_CALLBACK = 'event_callback';

// 리마인더봇 ID를 상수로 정의
export const REMINDER_BOT_ID = process.env.REMINDER_BOT_ID;

interface SlackEventBase {
  token: string;
  type: string;
}

// URL 검증용 이벤트
interface SlackUrlVerificationEvent extends SlackEventBase {
  type: typeof URL_VERIFICATION;
  challenge: string;
}

// 메시지 이벤트 상세 정보 - 추가 필드 업데이트
export interface SlackMessageEvent {
  type: typeof MESSAGE;
  channel: string;
  user: string;
  text: string;
  ts: string;
  event_ts: string;
  channel_type: string;
  // 추가된 필드들
  thread_ts?: string; // 스레드 타임스탬프
  parent_user_id?: string; // 부모 메시지 작성자 ID
  blocks?: any[]; // 메시지 블록 구조
  team?: string; // 팀 ID
  bot_id?: string; // 봇 ID
}

// 권한 정보 추가
interface SlackAuthorization {
  enterprise_id: string | null;
  team_id: string;
  user_id: string;
  is_bot: boolean;
  is_enterprise_install: boolean;
}

// 일반 메시지 이벤트 - 추가 필드 업데이트
interface SlackEventCallback extends SlackEventBase {
  type: typeof EVENT_CALLBACK | typeof URL_VERIFICATION;
  team_id: string;
  api_app_id: string;
  event?: SlackMessageEvent;
  event_id?: string;
  event_time?: number;
  challenge?: string;
  // 추가된 필드들
  authorizations?: SlackAuthorization[];
  is_ext_shared_channel?: boolean;
  event_context?: string;
  context_team_id?: string;
  context_enterprise_id?: string | null;
}

// 모든 이벤트 타입을 하나로 통합
export type SlackWebhookEvent = SlackUrlVerificationEvent | SlackEventCallback;

// 타입 가드 함수
export const isUrlVerificationEvent = (
  event: SlackWebhookEvent,
): event is SlackUrlVerificationEvent => {
  return event.type === URL_VERIFICATION;
};

// 추가 타입 가드 함수
export const isEventCallback = (
  event: SlackWebhookEvent,
): event is SlackEventCallback => {
  return event.type === EVENT_CALLBACK;
};

// 스레드 메시지인지 확인하는 유틸리티 함수
export const isThreadMessage = (event: SlackMessageEvent): boolean => {
  return !!event.thread_ts;
};

// 리마인더봇 메시지인지 확인하는 함수
export const isReminderBotParent = (event: SlackMessageEvent): boolean => {
  return !!event.parent_user_id && event.parent_user_id === REMINDER_BOT_ID;
};

// 멘션 관련 유틸리티 함수 추가
// 멘션 패턴: <@USER_ID>
export const MENTION_PATTERN = /<@([A-Z0-9]+)>/g;

// 메시지에 멘션이 있는지 확인
export const hasMention = (text: string): boolean => {
  return MENTION_PATTERN.test(text);
};

// 메시지에서 첫 번째 멘션된 사용자 ID 추출
export const extractFirstMentionedUser = (text: string): string | null => {
  const matches = text.match(MENTION_PATTERN);
  if (!matches || matches.length === 0) {
    return null;
  }

  // <@USER_ID> 형식에서 USER_ID만 추출
  const firstMention = matches[0];
  return firstMention.substring(2, firstMention.length - 1);
};

// 메시지에서 모든 멘션된 사용자 ID 추출
export const extractAllMentionedUsers = (text: string): string[] => {
  const matches = [...text.matchAll(MENTION_PATTERN)];
  return matches.map((match) => match[1]);
};

// 특정 사용자가 멘션되었는지 확인
export const isUserMentioned = (text: string, userId: string): boolean => {
  const pattern = new RegExp(`<@${userId}>`, 'i');
  return pattern.test(text);
};
