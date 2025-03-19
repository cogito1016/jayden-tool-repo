import { Module } from '@nestjs/common';
import { ConversationLogService } from './services/conversation-log.service';
import { ConversationLogRepository } from './repositories/conversation-log.repository';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [MemberModule],
  providers: [ConversationLogService, ConversationLogRepository],
  exports: [ConversationLogService, ConversationLogRepository],
})
export class ConversationLogModule {}
