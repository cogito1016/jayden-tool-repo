import { Injectable } from '@nestjs/common';
import { MemberRepository } from '../repositories/member.repository';
import { MemberEntity } from '../entities/member.entity';

@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  async findAllMembers(): Promise<MemberEntity[]> {
    return this.memberRepository.findAll();
  }
}
