import { NestFactory } from '@nestjs/core';
import { JobsModule } from './jobs.module';
import { environment } from '@libs/config/src/configuration';
import { SlackService } from '@libs/slack/slack.service';

async function bootstrap() {
  const app = await NestFactory.create(JobsModule);
  await app.listen(process.env.port ?? 3000);

  const slackService = app.get(SlackService);

  if (environment.reminder.testConversationId) {
    await slackService.postMsg({
      text: 'Jobs 서버가 실행되었습니다.',
      conversationId: environment.reminder.testConversationId,
    });
  }
}
bootstrap();
