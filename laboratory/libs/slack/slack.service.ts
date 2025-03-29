import { Injectable, Logger } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { testConversationId, token } from '@env/Token';
import {
  SlackMessageRequest,
  SlackMessageResponse,
} from './types/slack-post-message';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private readonly web: WebClient;

  constructor() {
    this.web = new WebClient(token);
  }

  public async postMsg(
    msg: SlackMessageRequest,
  ): Promise<SlackMessageResponse> {
    try {
      const result = (await this.web.chat.postMessage({
        text: msg.text,
        channel: msg.conversationId ?? testConversationId,
        attachments: msg.attachments,
      })) as SlackMessageResponse;

      this.logger.log(
        `Message sent successfully - ID: ${result.ts}, Channel: ${result.channel}`,
      );

      return result;
    } catch (error) {
      this.logger.error('Failed to send Slack message:', error);
      throw error;
    }
  }
}
