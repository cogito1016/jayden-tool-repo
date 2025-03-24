import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReminderService } from './reminder.service';
import { SlackModule } from 'libs/slack/slack.module';
import { ConversationLogModule } from 'libs/domains/conversation-log/conversation-log.module';
import { AiModule } from 'libs/ai/ai.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SlackModule,
    ConversationLogModule,
    AiModule,
  ],
  controllers: [],
  providers: [ReminderService],
})
export class ReminderModule {}
