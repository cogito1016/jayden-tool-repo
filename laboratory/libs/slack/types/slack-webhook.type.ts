interface SlackAttachment {
  text: string;
  id: number;
  fallback: string;
}

interface SlackMessage {
  text: string;
  username: string;
  bot_id: string;
  attachments: SlackAttachment[];
  type: string;
  subtype: string;
  ts: string;
}

export interface SlackWebhookSuccessResponse extends BasicResponse {
  channel: string;
  ts: string;
  message: SlackMessage;
}

export interface SlackWebhookErrorResponse extends BasicResponse {
  error: string;
}

export interface BasicResponse {
  ok: boolean;
  type?: string;
  challenge?: string;
}

export type SlackWebhookResponse =
  | SlackWebhookSuccessResponse
  | SlackWebhookErrorResponse;
