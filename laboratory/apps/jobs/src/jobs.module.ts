import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { ReminderModule } from './reminder-bot/reminder.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot(), ReminderModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
