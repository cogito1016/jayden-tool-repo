import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { MemberModule } from 'libs/domains/member/member.module';
import { ConversationLogModule } from 'libs/domains/conversation-log/conversation-log.module';

@Module({
  imports: [MemberModule, ConversationLogModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
