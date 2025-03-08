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
  channel: string;
  ts: string;
  message: SlackMessage;
  ok: true;
  type?: string;
  challenge?: string;
}

export interface SlackWebhookErrorResponse {
  error: string;
  ok: false;
  type?: string;
  challenge?: string;
}

export type SlackWebhookResponse =
  | SlackWebhookSuccessResponse
  | SlackWebhookErrorResponse;
