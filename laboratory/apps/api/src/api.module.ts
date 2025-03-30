import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { MemberModule } from '@libs/domains/member/member.module';
import { ConversationLogModule } from '@libs/domains/conversation-log/conversation-log.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@libs/config/src/config.module';

@Module({
  imports: [
    ConfigModule,

    // 캐싱 설정
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 5, // 5분 캐싱
      max: 100, // 최대 100개 항목
    }),

    MemberModule,
    ConversationLogModule,
  ],
  controllers: [ApiController],
  providers: [
    ApiService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class ApiModule {}
