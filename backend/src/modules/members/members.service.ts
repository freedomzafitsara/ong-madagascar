// backend/src/modules/members/members.service.ts
// VERSION CORRIGEE - savedMember est un objet, pas un tableau

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member, MembershipStatus, MembershipType } from '../../entities/member.entity';
import { User } from '../../entities/user.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberPDFService } from './member-pdf.service';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private memberPDFService: MemberPDFService,
  ) {}

  async createMembership(userId: string, createMemberDto: CreateMemberDto) {
    console.log('=== DEBUT CREATION MEMBRE ===');
    console.log('userId recu:', userId);
    console.log('createMemberDto:', JSON.stringify(createMemberDto, null, 2));

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      console.log('Utilisateur non trouve:', userId);
      throw new NotFoundException('Utilisateur non trouve');
    }
    console.log('Utilisateur trouve:', user.email);

    // SUPPRIME LA VERIFICATION D'ADHESION EXISTANTE

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    console.log('startDate:', startDate);
    console.log('expiryDate:', expiryDate);

    const memberNumber = await this.generateMemberNumber();
    console.log('memberNumber genere:', memberNumber);

    const amount = this.getAmountByType(createMemberDto.membershipType);
    console.log('amount:', amount);

    // CORRECTION: Creer le membre correctement
    const member = new Member();
    member.memberNumber = memberNumber;
    member.userId = userId;
    member.membershipType = createMemberDto.membershipType;
    member.startDate = startDate;
    member.expiryDate = expiryDate;
    member.amountPaid = amount;
    member.paymentMethod = createMemberDto.paymentMethod || 'bank';
    member.status = MembershipStatus.ACTIVE;

    const savedMember = await this.memberRepository.save(member);
    console.log('savedMember id:', savedMember.id);
    console.log('savedMember type:', typeof savedMember);
    console.log('savedMember est un tableau?', Array.isArray(savedMember));

    // Verifier que savedMember est un objet
    if (!savedMember || Array.isArray(savedMember)) {
      console.error('savedMember n\'est pas un objet valide:', savedMember);
      throw new Error('Erreur lors de la sauvegarde du membre');
    }

    // Generer la carte PDF
    try {
      const cardUrl = await this.memberPDFService.generateMemberCard(savedMember, user);
      savedMember.cardUrl = cardUrl;
      await this.memberRepository.save(savedMember);
      console.log('cardUrl generee:', cardUrl);
    } catch (error) {
      console.error('Erreur generation carte PDF:', error);
    }

    console.log('=== FIN CREATION MEMBRE ===');

    return {
      success: true,
      message: 'Adhesion creee avec succes',
      member: {
        id: savedMember.id,
        memberNumber: savedMember.memberNumber,
        membershipType: savedMember.membershipType,
        startDate: savedMember.startDate,
        expiryDate: savedMember.expiryDate,
        status: savedMember.status,
        amountPaid: savedMember.amountPaid,
        cardUrl: savedMember.cardUrl,
      },
    };
  }

  async getMemberById(id: string) {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!member) {
      throw new NotFoundException('Adhesion non trouvee');
    }
    return member;
  }

  async getMemberByUserId(userId: string) {
    const member = await this.memberRepository.findOne({
      where: { userId, status: MembershipStatus.ACTIVE },
      relations: ['user'],
    });
    return member || null;
  }

  async getAllMembers(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    
    const query: any = {};
    if (status) query.status = status;

    const [data, total] = await this.memberRepository.findAndCount({
      where: query,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const formattedData = data.map(member => ({
      id: member.id,
      memberNumber: member.memberNumber,
      membershipType: member.membershipType,
      status: member.status,
      amountPaid: member.amountPaid,
      startDate: member.startDate,
      expiryDate: member.expiryDate,
      paymentMethod: member.paymentMethod,
      cardUrl: member.cardUrl,
      qrCode: member.qrCode,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      user: member.user ? {
        id: member.user.id,
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        email: member.user.email,
        phone: member.user.phone,
        region: member.user.region,
      } : null,
    }));

    return { 
      data: formattedData, 
      total, 
      page, 
      totalPages: Math.ceil(total / limit),
      limit 
    };
  }

  async updateMemberStatus(id: string, status: string) {
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('Adhesion non trouvee');
    }
    member.status = status;
    await this.memberRepository.save(member);
    return { success: true, message: 'Statut mis a jour' };
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
      relations: ['user'],
    });
    if (!member) {
      throw new NotFoundException('Carte non trouvee');
    }
    
    if (!member.cardUrl && member.user) {
      try {
        const cardUrl = await this.memberPDFService.generateMemberCard(member, member.user);
        member.cardUrl = cardUrl;
        await this.memberRepository.save(member);
      } catch (error) {
        console.error('Erreur generation carte:', error);
      }
    }
    
    return { 
      cardUrl: member.cardUrl, 
      memberNumber: member.memberNumber,
      status: member.status,
      membershipType: member.membershipType,
      expiryDate: member.expiryDate,
      user: member.user ? {
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        email: member.user.email,
      } : null,
    };
  }

  async deleteMember(id: string) {
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('Adhesion non trouvee');
    }
    await this.memberRepository.remove(member);
    return { success: true, message: 'Adhesion supprimee' };
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
      [MembershipType.PREMIUM]: 100000,
      [MembershipType.STUDENT]: 15000,
      [MembershipType.HONORARY]: 0,
    };
    return amounts[type] || 25000;
  }
}