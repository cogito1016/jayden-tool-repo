import { AiService } from 'libs/ai/ai.service';
import { ConversationLogService } from 'libs/domains/conversation-log/services/conversation-log.service';
import { SlackService } from 'libs/slack/slack.service';
import { ReminderService } from './reminder.service';

describe('ReminderService', () => {
  let reminderService: ReminderService;

  beforeEach(() => {
    reminderService = new ReminderService(
      new SlackService(),
      new ConversationLogService(),
      new AiService(),
    );
  });

  it('should be defined', () => {
    expect(reminderService).toBeDefined();
  });

  it('should send reminder message', () => {
    const result = reminderService.handleCron();
    expect(result).toBeDefined();
  });
});
