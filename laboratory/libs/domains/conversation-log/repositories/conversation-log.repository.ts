// libs/domains/repositories/conversation-log.repository.ts
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'libs/domains/base.repository';
import { ConversationLog } from '../entities/conversation-log.entity';
import { REMINDER_BOT_ID } from 'libs/slack/types/slack-webhook-message';

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

  // 스레드의 원본 메시지 조회 (스레드 타임스탬프와 동일한 메시지 타임스탬프를 가진 메시지)
  async findThreadOriginMessage(
    threadTs: string,
  ): Promise<ConversationLog | null> {
    const messages = await this.knex(this.tableName)
      .where('message_ts', threadTs)
      .limit(1);

    return messages.length > 0 ? (messages[0] as ConversationLog) : null;
  }
}
