import { Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';

@Injectable()
export class SlackService {
  web: WebClient;

  constructor() {
    // Read a token from the environment variables
    const token = 'TOKEN_SECRET';

    // Initialize
    this.web = new WebClient(token);
  }

  public async postMsg() {
    const conversationId = 'CONVERSATION_ID_SECRET';

    await (async () => {
      const result = await this.web.chat.postMessage({
        text: 'Hello world!',
        channel: conversationId,
      });

      // The result contains an identifier for the message, `ts`.
      console.log(
        `Successfully send message ${result.ts} in conversation ${conversationId}`,
      );
    })();
  }
}
