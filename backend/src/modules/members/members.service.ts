// src/modules/members/members.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { PaginationService, PaginatedResult } from '../../common/services/pagination.service';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Member>> {
    return PaginationService.paginate(this.memberRepository, {
      page,
      limit,
      orderBy: 'createdAt',
      orderDirection: 'DESC',
    });
  }

  async findAll(): Promise<Member[]> {
    return this.memberRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Member> {
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('Membre non trouvé');
    }
    return member;
  }

  async findByUser(userId: string): Promise<Member[]> {
    return this.memberRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async generateMemberCard(userId: string): Promise<Member> {
    const year = new Date().getFullYear();
    const count = await this.memberRepository.count() + 1;
    const memberNumber = 'YM-' + year + '-' + String(count).padStart(4, '0');

    const member = this.memberRepository.create({
      userId: userId,
      memberNumber: memberNumber,
      membershipType: 'standard',
      status: 'active',
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    return this.memberRepository.save(member);
  }

  async renewMembership(id: string): Promise<Member> {
    const member = await this.findOne(id);
    member.status = 'active';
    member.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    return this.memberRepository.save(member);
  }

  async remove(id: string): Promise<void> {
    const member = await this.findOne(id);
    await this.memberRepository.remove(member);
  }
}