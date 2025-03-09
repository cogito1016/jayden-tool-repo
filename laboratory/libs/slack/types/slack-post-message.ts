import { ChatPostMessageResponse, MessageAttachment } from '@slack/web-api';

// 요청 파라미터 타입
export interface SlackMessageRequest {
  text: string;
  attachments?: MessageAttachment[];
  conversationId: string;
}

// 응답 타입 (Slack SDK의 타입 확장)
export interface SlackMessageResponse extends ChatPostMessageResponse {
  ok: boolean;
  ts: string;
  channel: string;
}
