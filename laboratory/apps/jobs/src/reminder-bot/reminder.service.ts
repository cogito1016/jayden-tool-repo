import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MemberObjectList } from 'env/MemberObjectList';
import { conversationId } from 'env/Token';
import { SlackService } from 'libs/slack/slack.service';
@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(private readonly slackService: SlackService) {}

  @Cron('0 0 8 * * 1') // 매주 월요일 오전 8시
  handleCron(): void {
    this.logger.debug('Called every 30 seconds');

    const datas = MemberObjectList;

    datas.forEach((data) => {
      const message = {
        text: `<@${data.slackId}>님, 진행중인 프로젝트 목록입니다.`,
        attachments: data.project.map((project) => ({
          text: project,
        })),
        conversationId: conversationId,
      };
      this.slackService.postMsg(message);
    });
  }
}
