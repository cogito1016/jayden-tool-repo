import { Injectable } from '@nestjs/common';
import { MessageAttachment, WebClient } from '@slack/web-api';
import { conversationId, token } from 'env/Token';

@Injectable()
export class SlackService {
  web: WebClient;

  constructor() {
    // Read a token from the environment variables

    // Initialize
    this.web = new WebClient(token);
  }

  public async postMsg(msg: {
    text: string;
    attachments: MessageAttachment[];
  }) {
    await (async () => {
      const result = await this.web.chat.postMessage({
        text: msg.text,
        channel: conversationId,
        attachments: msg.attachments,
      });

      // The result contains an identifier for the message, `ts`.
      console.log(
        `Successfully send message ${result.ts} in conversation ${conversationId}`,
      );
    })();
  }
}
