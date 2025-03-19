// libs/domains/conversation-log/services/conversation-log.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConversationLogRepository } from '../repositories/conversation-log.repository';
import { ConversationLog } from '../entities/conversation-log.entity';

import { MemberRepository } from 'libs/domains/member/repositories/member.repository';
import {
  isEventCallback,
  isReminderBotParent,
  isThreadMessage,
  SlackMessageEvent,
  SlackWebhookEvent,
} from 'libs/slack/types/slack-webhook-message';

@Injectable()
export class ConversationLogService {
  private readonly logger = new Logger(ConversationLogService.name);

  constructor(
    private readonly conversationLogRepository: ConversationLogRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  // 멘션 추출 함수 추가
  private extractMention(text: string): string | null {
    const mentionRegex = /<@([A-Z0-9]+)>/;
    const match = text.match(mentionRegex);
    return match ? match[1] : null;
  }

  // 메시지에 멘션이 있는지 확인하는 함수
  private isMentioned(messageEvent: SlackMessageEvent): boolean {
    const mentionRegex = /<@([A-Z0-9]+)>/;
    return mentionRegex.test(messageEvent.text);
  }

  async processWebhookEvent(event: SlackWebhookEvent): Promise<boolean> {
    // URL 검증 이벤트는 무시
    if (!isEventCallback(event) || !event.event) {
      return false;
    }

    const messageEvent = event.event;

    // 봇 메시지는 무시 (필요에 따라 조정)
    if (messageEvent.bot_id) {
      return false;
    }

    try {
      // 멤버 코드 조회
      const member = await this.memberRepository.findBySlackMemberId(
        messageEvent.user,
      );
      const memberCode = member ? member.member_code : '';

      // 멘션 추출
      const mentionedUser = this.extractMention(messageEvent.text);
      const isMention = !!mentionedUser;

      // 로그 데이터 생성
      const logData: ConversationLog = {
        member_code: memberCode,
        slack_member_id: messageEvent.user,
        message: messageEvent.text,
        channel_id: messageEvent.channel,
        message_ts: messageEvent.ts,
        thread_ts: messageEvent.thread_ts || null,
        parent_user_id: messageEvent.parent_user_id || null,
        is_thread_reply: isThreadMessage(messageEvent),
        is_reminder_thread: isReminderBotParent(messageEvent),
        is_mention: isMention,
        mentioned_user: mentionedUser,
      };

      // 저장
      await this.conversationLogRepository.create(logData);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to process webhook event: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async getThreadMessages(threadTs: string): Promise<ConversationLog[]> {
    return this.conversationLogRepository.findThreadMessages(threadTs);
  }

  // 사용자가 언급된 스레드의 메시지 조회
  async getUserReminderThreadMessages(slackMemberId: string): Promise<any[]> {
    // 리마인더봇이 부모인 스레드 중 사용자가 참여한 스레드 조회
    const userThreads =
      await this.conversationLogRepository.findUserReminderThreads(
        slackMemberId,
      );
    return userThreads;
  }
}
