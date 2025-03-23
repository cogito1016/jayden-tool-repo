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
  mentioned_users?: string;
  is_reminder_thread: boolean;
  is_reminder_target?: boolean;
  reminder_target_user?: string | null;
  authorization_users?: string;
  created_at?: Date;
}
