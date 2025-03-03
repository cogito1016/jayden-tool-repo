import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MemberObjectList } from 'env/MemberObjectList';
import { SlackService } from 'libs/slack/slack.service';
@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(private readonly slackService: SlackService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  handleCron(): void {
    this.logger.debug('Called every 30 seconds');

    const datas = MemberObjectList;

    datas.forEach((data) => {
      const message = {
        text: `<@${data.slackId}>님, 진행중인 프로젝트 목록입니다.`,
        attachments: data.project.map((project) => ({
          text: project,
        })),
      };
      this.slackService.postMsg(message);
    });
  }
}
