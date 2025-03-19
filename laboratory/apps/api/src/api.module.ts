import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { MemberModule } from 'libs/domains/member/member.module';

@Module({
  imports: [MemberModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
