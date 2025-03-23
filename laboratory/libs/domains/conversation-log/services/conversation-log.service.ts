// libs/domains/conversation-log/services/conversation-log.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConversationLogRepository } from '../repositories/conversation-log.repository';
import { ConversationLog } from '../entities/conversation-log.entity';

import { MemberRepository } from 'libs/domains/member/repositories/member.repository';
import {
  extractAllMentionedUsers,
  extractFirstMentionedUser,
  extractReminderTargetUser,
  isEventCallback,
  isReminderBotMessage,
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

  // 멘션 추출 함수 - 개선된 버전 사용
  private extractMention(text: string): string | null {
    return extractFirstMentionedUser(text);
  }

  // 메시지에 멘션이 있는지 확인하는 함수
  private isMentioned(messageEvent: SlackMessageEvent): boolean {
    return extractAllMentionedUsers(messageEvent.text).length > 0;
  }

  // 스레드의 타겟 사용자 식별 (리마인더봇이 언급한 사용자)
  private async identifyThreadTargetUser(
    threadTs: string,
  ): Promise<string | null> {
    try {
      // 스레드의 원본 메시지 조회
      const originMessage =
        await this.conversationLogRepository.findThreadOriginMessage(threadTs);

      // 원본 메시지가 없거나 리마인더봇 메시지가 아닌 경우
      if (!originMessage || !originMessage.is_reminder_thread) {
        return null;
      }

      // 리마인더봇이 첫 번째로 멘션한 사용자를 타겟으로 간주
      return originMessage.mentioned_users?.[0] || null;
    } catch (error) {
      this.logger.error(
        `Failed to identify thread target user: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  async processWebhookEvent(event: SlackWebhookEvent): Promise<boolean> {
    // URL 검증 이벤트는 무시
    if (!isEventCallback(event) || !event.event) {
      return false;
    }

    const messageEvent = event.event;

    // 봇 메시지 처리 (리마인더봇 메시지는 저장, 다른 봇은 무시)
    const isReminderBot = isReminderBotMessage(messageEvent);
    if (messageEvent.bot_id && !isReminderBot) {
      return false;
    }

    try {
      // 멤버 코드 조회
      const member = await this.memberRepository.findBySlackMemberId(
        messageEvent.user,
      );
      const memberCode = member ? member.member_code : '';

      // 멘션 추출
      const mentionedUsers = extractAllMentionedUsers(messageEvent.text);
      const firstMentionedUser =
        mentionedUsers.length > 0 ? mentionedUsers[0] : null;

      // 리마인더봇 타겟 사용자 식별
      let reminderTargetUser: string | null = null;
      let isTargetInThread = false;

      // 스레드 메시지인 경우, 원본 스레드의 타겟 사용자 식별
      if (isThreadMessage(messageEvent)) {
        if (messageEvent.thread_ts) {
          reminderTargetUser = await this.identifyThreadTargetUser(
            messageEvent.thread_ts,
          );
          // 현재 메시지 작성자가 타겟 사용자와 동일한지 확인
          isTargetInThread =
            !!reminderTargetUser && reminderTargetUser === messageEvent.user;
        }
      } else if (isReminderBot) {
        // 리마인더봇 원본 메시지인 경우, 타겟 사용자 바로 추출
        reminderTargetUser = extractReminderTargetUser(messageEvent);
      }

      // 로그 데이터 생성 (확장된 필드 포함)
      const logData: ConversationLog = {
        member_code: memberCode,
        slack_member_id: messageEvent.user,
        message: messageEvent.text,
        channel_id: messageEvent.channel,
        message_ts: messageEvent.ts,
        thread_ts: messageEvent.thread_ts || null,
        parent_user_id: messageEvent.parent_user_id || null,
        is_thread_reply: isThreadMessage(messageEvent),
        is_reminder_thread: isReminderBot || isReminderBotParent(messageEvent),
        is_mention: mentionedUsers.length > 0,
        mentioned_user: firstMentionedUser,
        mentioned_users: JSON.stringify(mentionedUsers), // JSON 문자열로 변환
        is_reminder_target: isTargetInThread, // 이 사용자가 리마인더 타겟인지 여부
        reminder_target_user: reminderTargetUser, // 리마인더 타겟 사용자
        authorization_users: JSON.stringify(
          event.authorizations?.map((auth) => auth.user_id) ||
            event.authed_users ||
            [],
        ), // JSON 문자열로 변환
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
