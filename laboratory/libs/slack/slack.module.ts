import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';

@Module({
  providers: [SlackService],
  exports: [SlackService], // SlackService를 외부에서 사용할 수 있도록 export
})
export class SlackModule {}
