import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  @Cron(CronExpression.EVERY_30_SECONDS)
  handleCron(): void {
    this.logger.debug('Called every 30 seconds');
  }
}
