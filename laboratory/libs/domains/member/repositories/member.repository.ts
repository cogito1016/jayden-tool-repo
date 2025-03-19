import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'libs/domains/base.repository';
import { MemberEntity } from '../entities/member.entity';

@Injectable()
export class MemberRepository extends BaseRepository<MemberEntity> {
  constructor() {
    super('member', 'idx');
  }
  async findBySlackMemberId(
    slackMemberId: string,
  ): Promise<MemberEntity | undefined> {
    return this.knex(this.tableName)
      .where('slack_member_id', slackMemberId)
      .first() as Promise<MemberEntity | undefined>;
  }
}
