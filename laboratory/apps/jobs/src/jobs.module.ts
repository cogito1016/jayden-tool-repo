import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { ReminderModule } from './reminder-bot/reminder.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SlackModule } from 'libs/slack/slack.module';

@Module({
  imports: [ScheduleModule.forRoot(), ReminderModule, SlackModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
