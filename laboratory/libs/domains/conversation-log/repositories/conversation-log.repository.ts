// libs/domains/repositories/conversation-log.repository.ts
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@libs/domains/base.repository';
import { ConversationLog } from '../entities/conversation-log.entity';
import { REMINDER_BOT_ID } from '@libs/slack/types/slack-webhook-message';

@Injectable()
export class ConversationLogRepository extends BaseRepository<ConversationLog> {
  constructor() {
    super('conversation_log', 'idx');
  }

  // 리마인더봇이 부모이고 특정 사용자가 참여한 스레드 조회
  async findUserReminderThreads(
    slackMemberId: string,
  ): Promise<ConversationLog[]> {
    const threadMessages = await this.knex(this.tableName)
      .where('parent_user_id', REMINDER_BOT_ID)
      .andWhere(function () {
        this.where('slack_member_id', slackMemberId).orWhere(
          'is_reminder_thread',
          true,
        );
      })
      .orderBy('thread_ts', 'desc')
      .orderBy('message_ts', 'asc');

    return threadMessages as ConversationLog[];
  }

  // 특정 스레드의 모든 메시지 조회
  async findThreadMessages(threadTs: string): Promise<ConversationLog[]> {
    return this.knex(this.tableName)
      .where('thread_ts', threadTs)
      .orderBy('message_ts', 'asc') as Promise<ConversationLog[]>;
  }

  // 스레드의 원본 메시지 조회 방법 개선
  async findThreadOriginMessage(
    threadTs: string,
  ): Promise<ConversationLog | null> {
    // 1. message_ts가 thread_ts와 일치하는 메시지 찾기
    let messages = await this.knex(this.tableName)
      .where('message_ts', threadTs)
      .limit(1);

    // 2. 일치하는 메시지가 없으면, thread_ts 필드가 NULL이고 message_ts가 thread_ts와 일치하는 메시지 찾기
    if (messages.length === 0) {
      messages = await this.knex(this.tableName)
        .whereNull('thread_ts')
        .andWhere('message_ts', threadTs)
        .limit(1);
    }

    // 3. 여전히 없으면, thread_ts가 해당 값인 메시지들 중 가장 오래된 메시지 찾기 (첫 메시지)
    if (messages.length === 0) {
      messages = await this.knex(this.tableName)
        .where('thread_ts', threadTs)
        .orderBy('message_ts', 'asc')
        .limit(1);
    }

    return messages.length > 0 ? (messages[0] as ConversationLog) : null;
  }

  // 특정 조건의 스레드 메시지 조회 (예: 리마인더 타겟인 메시지)
  async findSpecificThreadMessages(
    threadTs: string,
    isReminderTarget: boolean = false,
  ): Promise<ConversationLog[]> {
    return this.knex(this.tableName)
      .where('thread_ts', threadTs)
      .andWhere('is_reminder_target', isReminderTarget)
      .orderBy('message_ts', 'asc') as Promise<ConversationLog[]>;
  }

  // 스레드가 리마인더 스레드인지 확인
  async isReminderThread(threadTs: string): Promise<boolean> {
    const reminderMessages = await this.knex(this.tableName)
      .where('thread_ts', threadTs)
      .andWhere('is_reminder_thread', true)
      .count('idx as count')
      .first();

    // count 값이 문자열이나 숫자일 수 있으므로 안전하게 처리

    const count = reminderMessages?.count;
    return count ? Number(count) > 0 : false;
  }

  /**
   * 지난 주의 리마인더 스레드를 조회합니다.
   * @param startDate 조회 시작일
   * @returns 지난 주의 리마인더 스레드 목록
   */
  async findLastWeekReminderThreads(
    startDate: Date,
  ): Promise<ConversationLog[]> {
    const threads = await this.knex(this.tableName)
      .where('is_reminder_thread', true)
      .andWhere('created_at', '>=', startDate)
      .andWhere('created_at', '<=', new Date())
      .orderBy('created_at', 'desc');

    return threads as ConversationLog[];
  }
}
