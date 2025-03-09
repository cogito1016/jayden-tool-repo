import { Injectable } from '@nestjs/common';
import {
  SlackWebhookEvent,
  URL_VERIFICATION,
} from 'libs/slack/types/slack-webhook-message';

@Injectable()
export class ApiService {
  processUserReponse(webhookData: SlackWebhookEvent) {
    if (webhookData.type === URL_VERIFICATION) {
      return webhookData.challenge;
    }

    console.log(webhookData);
    return null;
  }
  getHello(): string {
    return 'Hello World!';
  }
}
