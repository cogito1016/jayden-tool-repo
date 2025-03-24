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
  REMINDER_BOT_ID,
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

  // 리마인더 메시지의 타겟 사용자를 식별하는 로직
  private async identifyReminderTargetUser(
    threadTs: string,
    currentUserId: string,
  ): Promise<{ targetUserId: string | null; isCurrentUserTarget: boolean }> {
    try {
      // 1. 스레드 원본 메시지 조회
      const originMessage =
        await this.conversationLogRepository.findThreadOriginMessage(threadTs);

      this.logger.verbose('[타겟 식별] 스레드 원본 메시지 조회 결과', {
        found: !!originMessage,
        message_ts: originMessage?.message_ts,
        thread_ts: threadTs,
      });

      if (originMessage) {
        let targetUserId: string | null = null;

        // 2. 원본 메시지에서 멘션된 사용자 확인
        if (originMessage.mentioned_user) {
          targetUserId = originMessage.mentioned_user;
        } else if (originMessage.mentioned_users) {
          try {
            const mentionedUsers = JSON.parse(originMessage.mentioned_users);
            if (Array.isArray(mentionedUsers) && mentionedUsers.length > 0) {
              targetUserId = mentionedUsers[0];
            }
          } catch (err) {
            this.logger.warn('[타겟 식별] mentioned_users JSON 파싱 실패', {
              mentioned_users: originMessage.mentioned_users,
              error: err.message,
            });
          }
        }

        // 3. 결과 반환
        const isCurrentUserTarget = targetUserId === currentUserId;

        this.logger.verbose('[타겟 식별] 타겟 사용자 식별 결과', {
          target_user_id: targetUserId,
          current_user_id: currentUserId,
          is_current_user_target: isCurrentUserTarget,
        });

        return { targetUserId, isCurrentUserTarget };
      }

      // 원본 메시지를 찾지 못한 경우
      return { targetUserId: null, isCurrentUserTarget: false };
    } catch (error) {
      this.logger.error(
        `[타겟 식별] 타겟 사용자 식별 중 오류: ${error.message}`,
        error.stack,
      );
      return { targetUserId: null, isCurrentUserTarget: false };
    }
  }

  async processWebhookEvent(event: SlackWebhookEvent): Promise<boolean> {
    // URL 검증 이벤트는 무시
    if (!isEventCallback(event) || !event.event) {
      return false;
    }

    const messageEvent = event.event;

    // 리마인더봇 ID 로깅 (디버깅용)
    this.logger.verbose('[이벤트 처리] 리마인더봇 ID 확인', {
      reminder_bot_id: REMINDER_BOT_ID,
      bot_id_type: typeof REMINDER_BOT_ID,
      bot_id_length: REMINDER_BOT_ID ? REMINDER_BOT_ID.length : 0,
    });

    // 봇 메시지 처리 (리마인더봇 메시지는 저장, 다른 봇은 무시)
    const isReminderBot = isReminderBotMessage(messageEvent);
    this.logger.verbose(
      `[이벤트 처리] 봇 메시지 체크: ${isReminderBot ? '리마인더봇' : messageEvent.bot_id ? '다른 봇' : '사용자'}`,
      {
        bot_id: messageEvent.bot_id,
        reminder_bot_id: REMINDER_BOT_ID,
        actual_match: messageEvent.bot_id === REMINDER_BOT_ID,
      },
    );

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

      // 리마인더 타겟 사용자 식별 (단순화된 로직)
      let reminderTargetUser: string | null = null;
      let isTargetInThread = false;

      if (isThreadMessage(messageEvent) && messageEvent.thread_ts) {
        // 새로운 타겟 사용자 식별 메서드 사용
        const { targetUserId, isCurrentUserTarget } =
          await this.identifyReminderTargetUser(
            messageEvent.thread_ts,
            messageEvent.user,
          );

        reminderTargetUser = targetUserId;
        isTargetInThread = isCurrentUserTarget;
      } else if (isReminderBot) {
        // 리마인더봇 원본 메시지인 경우, 타겟 사용자 바로 추출
        this.logger.verbose('[이벤트 처리] 리마인더봇 원본 메시지 분석', {
          bot_id: messageEvent.bot_id,
          text: messageEvent.text,
          has_blocks:
            !!messageEvent.blocks && Array.isArray(messageEvent.blocks),
        });

        reminderTargetUser = extractReminderTargetUser(messageEvent);

        this.logger.verbose(
          '[이벤트 처리] 리마인더봇 원본 메시지의 타겟 사용자',
          {
            reminder_target_user: reminderTargetUser,
          },
        );
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

      // 최종 저장 데이터 로깅
      this.logger.debug('저장될 대화 로그 데이터', {
        message_ts: logData.message_ts,
        is_reminder_target: logData.is_reminder_target,
        reminder_target_user: logData.reminder_target_user,
      });

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

  /**
   * 지난 주의 리마인더 스레드를 조회합니다.
   * @returns 지난 주의 리마인더 스레드 목록
   */
  async getLastWeekReminderThreads(): Promise<ConversationLog[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const lastWeekThreads =
      await this.conversationLogRepository.findLastWeekReminderThreads(
        oneWeekAgo,
      );

    this.logger.verbose('[리마인더 스레드 조회] 지난 주 스레드 조회 결과', {
      threadCount: lastWeekThreads.length,
      startDate: oneWeekAgo.toISOString(),
    });

    return lastWeekThreads;
  }
}
