import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReminderBotService } from './services/reminder-bot.service';
import { ConversationLogModule } from '../conversation-log/conversation-log.module';
import { AiModule } from '../../ai/ai.module';

@Module({
  imports: [ScheduleModule.forRoot(), ConversationLogModule, AiModule],
  providers: [ReminderBotService],
  exports: [ReminderBotService],
})
export class ReminderBotModule {}
