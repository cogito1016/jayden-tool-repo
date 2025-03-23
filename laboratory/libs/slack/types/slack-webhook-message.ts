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
  authed_users?: string[]; // 이전 버전 호환성을 위해 유지
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

// 리마인더봇이 생성한 원본 메시지인지 확인하는 함수
export const isReminderBotMessage = (event: SlackMessageEvent): boolean => {
  // bot_id가 있고, 해당 ID가 REMINDER_BOT_ID와 같은 경우
  return event.bot_id === REMINDER_BOT_ID;
};

// 메시지에서 리마인더봇이 언급한 주요 대상 사용자 식별
export const extractReminderTargetUser = (
  event: SlackMessageEvent,
): string | null => {
  // 리마인더봇 메시지가 아니면 null 반환
  if (!isReminderBotMessage(event)) {
    return null;
  }

  // 디버깅용 로그 (개발 완료 후 제거)
  console.log('리마인더봇 메시지 분석:', {
    text: event.text,
    bot_id: event.bot_id,
    reminder_bot_id: REMINDER_BOT_ID,
  });

  // 메시지 텍스트 유효성 검사
  if (!event.text) {
    return null;
  }

  // 메시지에서 첫 번째 멘션을 대상 사용자로 간주
  // 1. 메시지 블록에서 멘션 확인
  if (event.blocks && Array.isArray(event.blocks)) {
    // 블록 내 멘션 확인
    for (const block of event.blocks) {
      if (block.elements && Array.isArray(block.elements)) {
        for (const element of block.elements) {
          if (element.elements && Array.isArray(element.elements)) {
            for (const subElement of element.elements) {
              if (subElement.type === 'user' && subElement.user_id) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return subElement.user_id;
              }
            }
          }
        }
      }
    }
  }

  // 2. 텍스트에서 멘션 추출
  return extractFirstMentionedUser(event.text);
};

// 스레드 참여자가 대상 사용자인지 확인하는 함수
export const isTargetUser = (
  threadTargetUserId: string,
  userId: string,
): boolean => {
  return threadTargetUserId === userId;
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
