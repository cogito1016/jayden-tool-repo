import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ReminderService],
})
export class ReminderModule {}
