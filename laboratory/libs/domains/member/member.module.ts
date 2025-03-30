import { Module } from '@nestjs/common';
import { MemberRepository } from './repositories/member.repository';
import { MemberService } from './services/member.service';
import { KnexModule } from 'nestjs-knex';
import { environment } from '@libs/config/src';

@Module({
  imports: [
    KnexModule.forRoot({
      config: {
        client: 'mysql2',
        useNullAsDefault: true,
        connection: {
          host: environment.database.host,
          user: environment.database.username,
          password: environment.database.password,
          database: environment.database.database,
        },
      },
    }),
  ],
  providers: [MemberRepository, MemberService],
  exports: [MemberRepository, MemberService],
})
export class MemberModule {}
