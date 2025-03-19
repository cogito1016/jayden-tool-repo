export interface ConversationLog {
  idx?: number;
  member_code: string;
  slack_member_id: string;
  message: string;
  channel_id: string;
  message_ts: string;
  thread_ts?: string | null;
  parent_user_id?: string | null;
  is_thread_reply: boolean;
  is_mention: boolean;
  mentioned_user?: string | null;
  is_reminder_thread: boolean;
  created_at?: Date;
}
