import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SlackService } from 'libs/slack/slack.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(private readonly slackService: SlackService) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  handleCron(): void {
    this.logger.debug('Called every 30 seconds');
    this.slackService.postMsg();
  }
}
