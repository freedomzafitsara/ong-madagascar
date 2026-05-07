import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member, MembershipStatus, MembershipType } from '../../entities/member.entity';
import { User } from '../../entities/user.entity';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createMembership(userId: string, createMemberDto: CreateMemberDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const existingMember = await this.memberRepository.findOne({
      where: { userId, status: MembershipStatus.ACTIVE },
    });
    if (existingMember) {
      throw new BadRequestException('Vous avez déjà une adhésion active');
    }

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const memberNumber = await this.generateMemberNumber();
    const amount = this.getAmountByType(createMemberDto.membershipType);

    const member = this.memberRepository.create({
      memberNumber,
      userId,
      membershipType: createMemberDto.membershipType,
      startDate,
      expiryDate,
      amountPaid: amount,
      paymentMethod: createMemberDto.paymentMethod || 'bank',
      status: MembershipStatus.ACTIVE,
    });

    const savedMember = await this.memberRepository.save(member);

    return {
      success: true,
      message: 'Adhésion créée avec succès',
      member: {
        id: savedMember.id,
        memberNumber: savedMember.memberNumber,
        membershipType: savedMember.membershipType,
        startDate: savedMember.startDate,
        expiryDate: savedMember.expiryDate,
        status: savedMember.status,
        amountPaid: savedMember.amountPaid,
      },
    };
  }

  async getMemberById(id: string) {
    const member = await this.memberRepository.findOne({
      where: { id },
    });
    if (!member) {
      throw new NotFoundException('Adhésion non trouvée');
    }
    return member;
  }

  async getMemberByUserId(userId: string) {
    const member = await this.memberRepository.findOne({
      where: { userId, status: MembershipStatus.ACTIVE },
    });
    return member || null;
  }

  async getAllMembers(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const query: any = {};
    if (status) query.status = status;

    const [data, total] = await this.memberRepository.findAndCount({
      where: query,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateMemberStatus(id: string, status: string) {
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('Adhésion non trouvée');
    }
    member.status = status;
    await this.memberRepository.save(member);
    return { success: true, message: 'Statut mis à jour' };
  }

  async getStats() {
    const total = await this.memberRepository.count();
    const active = await this.memberRepository.count({ where: { status: MembershipStatus.ACTIVE } });
    const expired = await this.memberRepository.count({ where: { status: MembershipStatus.EXPIRED } });
    const pending = await this.memberRepository.count({ where: { status: MembershipStatus.PENDING } });
    const totalRevenue = await this.memberRepository.sum('amountPaid') || 0;

    return { total, active, expired, pending, totalRevenue };
  }

  async getMemberCard(memberNumber: string) {
    const member = await this.memberRepository.findOne({
      where: { memberNumber },
    });
    if (!member) {
      throw new NotFoundException('Carte non trouvée');
    }
    return { 
      cardUrl: member.cardUrl, 
      memberNumber: member.memberNumber,
      status: member.status,
      membershipType: member.membershipType,
      expiryDate: member.expiryDate,
    };
  }

  private async generateMemberNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.memberRepository.count();
    const number = (count + 1).toString().padStart(4, '0');
    return `YM-${year}-${number}`;
  }

  private getAmountByType(type: string): number {
    const amounts: Record<string, number> = {
      [MembershipType.STANDARD]: 25000,
      [MembershipType.PREMIUM]: 50000,
      [MembershipType.STUDENT]: 15000,
      [MembershipType.HONORARY]: 0,
    };
    return amounts[type] || 25000;
  }
}