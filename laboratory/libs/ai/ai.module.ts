import { Module } from '@nestjs/common';
import { AiService } from '@libs/ai/ai.service';

@Module({
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
