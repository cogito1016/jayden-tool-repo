import { Injectable } from '@nestjs/common';
import { ConversationLogService } from 'libs/domains/conversation-log/services/conversation-log.service';
import { MemberEntity } from 'libs/domains/member/entities/member.entity';
import { MemberService } from 'libs/domains/member/services/member.service';
import { LoggerUtil } from 'libs/common/utils/logger.util';
import {
  SlackWebhookEvent,
  URL_VERIFICATION,
} from 'libs/slack/types/slack-webhook-message';

@Injectable()
export class ApiService {
  private readonly logger = new LoggerUtil(ApiService.name);

  constructor(
    private readonly memberService: MemberService,
    private readonly conversationLogService: ConversationLogService,
  ) {}

  async processUserReponse(webhookData: SlackWebhookEvent) {
    if (webhookData.type === URL_VERIFICATION) {
      this.logger.info('URL 검증 이벤트 수신', {
        challenge: webhookData.challenge,
      });
      return webhookData.challenge;
    }

    this.logger.info('슬랙 이벤트 수신', {
      type: webhookData.type,
      event_id: 'event' in webhookData ? webhookData.event_id : undefined,
    });

    try {
      await this.conversationLogService.processWebhookEvent(webhookData);
      return { success: true };
    } catch (error) {
      this.logger.error('이벤트 처리 중 오류 발생', error.stack, {
        error_message: error.message,
        event_type: webhookData.type,
      });
      throw error;
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getMembers(): Promise<MemberEntity[]> {
    try {
      const members = await this.memberService.findAllMembers();
      this.logger.info('멤버 조회 성공', { count: members.length });
      return members;
    } catch (error) {
      this.logger.error('멤버 조회 실패', error.stack);
      throw error;
    }
  }
}
