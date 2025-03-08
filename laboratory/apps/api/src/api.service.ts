import { Injectable } from '@nestjs/common';
import { SlackWebhookResponse } from 'libs/slack/types/slack-webhook.type';

@Injectable()
export class ApiService {
  processUserReponse(webhookData: SlackWebhookResponse) {
    if (!webhookData.ok) {
      console.error('Slack 웹훅 오류:', webhookData.error);
      return;
    }

    const { channel, ts, message } = webhookData;

    console.log('Slack 채널:', channel);
    console.log('Slack 메시지 ID:', ts);
    console.log('Slack 메시지:', message);
  }
  getHello(): string {
    return 'Hello World!';
  }
}
