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

export interface SlackWebhookSuccessResponse {
  ok: true;
  channel: string;
  ts: string;
  message: SlackMessage;
}

export interface SlackWebhookErrorResponse {
  ok: false;
  error: string;
}

export type SlackWebhookResponse =
  | SlackWebhookSuccessResponse
  | SlackWebhookErrorResponse;
