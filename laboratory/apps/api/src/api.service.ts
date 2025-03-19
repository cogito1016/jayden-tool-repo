import { Injectable } from '@nestjs/common';
import { ConversationLogService } from 'libs/domains/conversation-log/services/conversation-log.service';
import { MemberEntity } from 'libs/domains/member/entities/member.entity';
import { MemberService } from 'libs/domains/member/services/member.service';
import {
  SlackWebhookEvent,
  URL_VERIFICATION,
} from 'libs/slack/types/slack-webhook-message';

@Injectable()
export class ApiService {
  constructor(
    private readonly memberService: MemberService,
    private readonly conversationLogService: ConversationLogService,
  ) {}

  async processUserReponse(webhookData: SlackWebhookEvent) {
    if (webhookData.type === URL_VERIFICATION) {
      console.log('URL 검증 이벤트');
      console.log(webhookData.challenge);
      return webhookData.challenge;
    }

    console.log(webhookData);
    await this.conversationLogService.processWebhookEvent(webhookData);
    return null;
  }
  getHello(): string {
    return 'Hello World!';
  }

  async getMembers(): Promise<MemberEntity[]> {
    return await this.memberService.findAllMembers();
  }
}
