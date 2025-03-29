import { NestFactory } from '@nestjs/core';
import { JobsModule } from './jobs.module';
import { testConversationId } from '@env/Token';
import { SlackService } from '@libs/slack/slack.service';

async function bootstrap() {
  const app = await NestFactory.create(JobsModule);
  await app.listen(process.env.port ?? 3000);

  const slackService = app.get(SlackService);
  await slackService.postMsg({
    text: 'Jobs 서버가 실행되었습니다.',
    conversationId: testConversationId,
  });
}
bootstrap();
