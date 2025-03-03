import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { SlackModule } from 'libs/slack/slack.module';

@Module({
  imports: [SlackModule],
  controllers: [],
  providers: [ReminderService],
})
export class ReminderModule {}
