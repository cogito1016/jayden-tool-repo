import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MemberObjectList } from '@env/MemberObjectList';
import { conversationId } from '@env/Token';
import { SlackService } from '@libs/slack/slack.service';
import { ConversationLogService } from '@libs/domains/conversation-log/services/conversation-log.service';
import { AiService } from '@libs/ai/ai.service';
import { WebClient } from '@slack/web-api';
import { ConversationLog } from '@libs/domains/conversation-log/entities/conversation-log.entity';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly slackService: SlackService,
    private readonly conversationLogService: ConversationLogService,
    private readonly aiService: AiService,
  ) {}

  async onApplicationBootstrap() {
    // await this.sendProjectListReminder();
    await this.sendAiBasedReminder();
  }

  /**
   * 매주 월요일 오전 8시에 실행되는 리마인더 메시지 발송
   */
  @Cron('0 8 * * 1') // 매주 월요일 오전 8시
  async handleCron(): Promise<void> {
    try {
      // 1. 기존 프로젝트 리스트 기반 리마인더 실행
      await this.sendProjectListReminder();

      // 2. AI 기반 리마인더 실행
      await this.sendAiBasedReminder();
    } catch (error) {
      this.logger.error(
        `[리마인더] 실행 중 오류 발생: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 프로젝트 리스트 기반 리마인더 메시지 발송
   */
  private async sendProjectListReminder(): Promise<void> {
    try {
      const datas = MemberObjectList;

      for (const data of datas) {
        const message = {
          text: `<@${data.slackId}>님, 진행중인 프로젝트 목록입니다.`,
          attachments: data.project.map((project) => ({
            text: project,
          })),
          conversationId: conversationId,
        };
        await this.slackService.postMsg(message);
      }

      this.logger.log('[프로젝트 리스트 리마인더] 발송 완료');
    } catch (error) {
      this.logger.error(
        `[프로젝트 리스트 리마인더] 발송 중 오류 발생: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * AI 기반 리마인더 메시지 발송
   */
  private async sendAiBasedReminder(): Promise<void> {
    try {
      // 1. 지난 주의 리마인더 스레드 조회
      const lastWeekThreads =
        await this.conversationLogService.getLastWeekReminderThreads();

      this.logger.log(
        `[AI 리마인더] ${lastWeekThreads.length}개의 스레드 처리 시작`,
      );

      // 스레드 목록을 슬랙 멤버 ID별로 그룹화
      const lastWeekThreadsBySlackMemberIds = new Map<
        string,
        ConversationLog[]
      >();

      lastWeekThreads.forEach((thread) => {
        if (!thread.member_code) {
          return;
        }

        const slackMemberId = thread.slack_member_id;
        if (!lastWeekThreadsBySlackMemberIds.has(slackMemberId)) {
          lastWeekThreadsBySlackMemberIds.set(slackMemberId, [thread]);
        } else {
          lastWeekThreadsBySlackMemberIds.get(slackMemberId)?.push(thread);
        }
      });

      const reminderBotMentionedThreads = lastWeekThreads.filter(
        (thread) =>
          thread.member_code === '' &&
          thread.is_mention &&
          thread.mentioned_user,
      );

      const reminderBotMentionedThreadsBySlackMemberIds = new Map<
        string,
        ConversationLog[]
      >();

      reminderBotMentionedThreads.forEach((thread) => {
        const slackMemberId = thread.mentioned_user;
        if (!slackMemberId) {
          return;
        }

        if (!reminderBotMentionedThreadsBySlackMemberIds.has(slackMemberId)) {
          reminderBotMentionedThreadsBySlackMemberIds.set(slackMemberId, [
            thread,
          ]);
        } else {
          reminderBotMentionedThreadsBySlackMemberIds
            .get(slackMemberId)
            ?.push(thread);
        }
      });

      for (const slackMemberId of lastWeekThreadsBySlackMemberIds.keys()) {
        try {
          const threads = lastWeekThreadsBySlackMemberIds.get(slackMemberId);
          if (!threads) {
            this.logger.warn(
              `[AI 리마인더] 스레드 목록 누락 - slack_member_id: ${slackMemberId}`,
            );
            continue;
          }

          // 3. AI 동기부여 메시지 생성
          const aiMessage =
            await this.aiService.generateMotivationalMessage(threads);

          // 4. AI 메시지를 스레드에 추가
          const aiMessageTarget =
            reminderBotMentionedThreadsBySlackMemberIds.get(slackMemberId) ?? [
              {
                channel_id: '',
                thread_ts: '',
                message_ts: '',
              },
            ];
          console.log(aiMessage);

          if (aiMessageTarget) {
            await this.slackService.postMsg({
              conversationId: aiMessageTarget[0].channel_id,
              thread_ts: aiMessageTarget[0].message_ts ?? '',
              text: aiMessage,
            });
          }

          this.logger.verbose(
            `[AI 리마인더] AI 메시지 추가 완료 - 스레드: ${aiMessageTarget[0].thread_ts}`,
          );
        } catch (error) {
          this.logger.error(
            `[AI 리마인더] 스레드 처리 중 오류 발생: ${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log('[AI 리마인더] 모든 스레드 처리 완료');
    } catch (error) {
      this.logger.error(
        `[AI 리마인더] 실행 중 오류 발생: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
