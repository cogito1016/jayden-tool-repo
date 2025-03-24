import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConversationLogService } from '../../conversation-log/services/conversation-log.service';
import { AiService } from '../../../ai/ai.service';
import { WebClient } from '@slack/web-api';

@Injectable()
export class ReminderBotService {
  private readonly logger = new Logger(ReminderBotService.name);
  private readonly client: WebClient;

  constructor(
    private readonly conversationLogService: ConversationLogService,
    private readonly aiService: AiService,
  ) {
    this.client = new WebClient(process.env.SLACK_BOT_TOKEN);
  }

  /**
   * 매주 월요일 오전 8시에 실행되는 리마인더 메시지 발송
   */
  @Cron('0 8 * * 1') // 매주 월요일 오전 8시
  async sendWeeklyReminder(): Promise<void> {
    try {
      // 1. 지난 주의 리마인더 스레드 조회
      const lastWeekThreads =
        await this.conversationLogService.getLastWeekReminderThreads();

      this.logger.log(
        `[주간 리마인더] ${lastWeekThreads.length}개의 스레드 처리 시작`,
      );

      for (const thread of lastWeekThreads) {
        try {
          if (!thread.thread_ts || !thread.channel_id) {
            this.logger.warn(
              `[주간 리마인더] 스레드 정보 누락 - thread_ts: ${thread.thread_ts}, channel_id: ${thread.channel_id}`,
            );
            continue;
          }

          // 2. 스레드의 모든 메시지 조회
          const threadMessages =
            await this.conversationLogService.getThreadMessages(
              thread.thread_ts,
            );

          // 3. AI 동기부여 메시지 생성
          const aiMessage =
            await this.aiService.generateMotivationalMessage(threadMessages);

          // 4. AI 메시지를 스레드에 추가
          await this.client.chat.postMessage({
            channel: thread.channel_id,
            thread_ts: thread.thread_ts,
            text: aiMessage,
          });

          this.logger.verbose(
            `[주간 리마인더] AI 메시지 추가 완료 - 스레드: ${thread.thread_ts}`,
          );
        } catch (error) {
          this.logger.error(
            `[주간 리마인더] 스레드 처리 중 오류 발생: ${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log('[주간 리마인더] 모든 스레드 처리 완료');
    } catch (error) {
      this.logger.error(
        `[주간 리마인더] 실행 중 오류 발생: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
