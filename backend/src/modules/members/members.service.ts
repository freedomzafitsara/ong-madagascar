import { Injectable, NotFoundException, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Member, MembershipStatus, MembershipType, PaymentMethod } from '../../entities/member.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberPDFService } from './member-pdf.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private memberPDFService: MemberPDFService,
    private uploadService: UploadService,
  ) {}

  // ============================================================
  // CREATION D UN MEMBRE AVEC NOUVEL UTILISATEUR
  // ============================================================

  async createMembership(createMemberDto: CreateMemberDto): Promise<any> {
    this.logger.log('Creation d une nouvelle adhesion');

    const { user: userData, membershipType, paymentMethod, amountPaid, startDate, endDate } = createMemberDto;

    // 1. Verifier si l utilisateur existe deja par email
    let user = await this.userRepository.findOne({
      where: { email: userData.email }
    });

    // 2. Si l utilisateur existe deja, verifier qu il n est pas deja membre
    if (user) {
      this.logger.log(`Utilisateur existant trouve: ${user.email}`);
      
      // Verifier si cet utilisateur a deja une adhesion active
      const existingMember = await this.memberRepository.findOne({
        where: { userId: user.id, status: MembershipStatus.ACTIVE }
      });

      if (existingMember) {
        throw new ConflictException('Cet utilisateur a deja une adhesion active');
      }
    } else {
      // 3. Creer un nouvel utilisateur avec le role MEMBER
      const hashedPassword = await bcrypt.hash('YMad2025!', 10);
      
      user = this.userRepository.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || null,
        region: userData.region || null,
        password: hashedPassword,
        role: UserRole.MEMBER,
        isActive: true,
        emailVerified: true,
      });
      
      user = await this.userRepository.save(user);
      this.logger.log(`Nouvel utilisateur cree: ${user.email} avec ID ${user.id}`);
    }

    // 4. Generer le numero de membre unique
    const memberNumber = await this.generateMemberNumber();
    this.logger.log(`Numero de membre genere: ${memberNumber}`);

    // 5. Calculer le montant selon le type d adhesion
    const amount = this.getAmountByType(membershipType);

    // 6. Creer l adhesion
    const member = new Member();
    member.memberNumber = memberNumber;
    member.userId = user.id;
    member.membershipType = membershipType;
    member.startDate = new Date(startDate);
    member.expiryDate = new Date(endDate);
    member.amountPaid = amountPaid || amount;
    member.paymentMethod = paymentMethod;
    member.status = MembershipStatus.ACTIVE;

    const savedMember = await this.memberRepository.save(member);
    this.logger.log(`Adhesion creee avec l identifiant ${savedMember.id} pour l utilisateur ${user.email}`);

    // 7. Generer et uploader la carte membre PDF vers Cloudinary
    try {
      const cardUrl = await this.memberPDFService.generateMemberCard(savedMember, user);
      savedMember.cardUrl = cardUrl;
      await this.memberRepository.save(savedMember);
      this.logger.log(`Carte membre generee et uploadee sur Cloudinary pour ${memberNumber}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la generation de la carte: ${error.message}`);
    }

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
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        region: user.region,
      },
    };
  }

  // ============================================================
  // RECUPERATION DE TOUS LES MEMBRES (EXCLUT ADMIN)
  // ============================================================

  async getAllMembers(page: number = 1, limit: number = 10, status?: string) {
    try {
      const skip = (page - 1) * limit;
      
      const queryBuilder = this.memberRepository
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.user', 'user')
        .where('user.role != :superAdminRole', { superAdminRole: 'super_admin' })
        .andWhere('user.role != :adminRole', { adminRole: 'admin' });

      if (status && status !== 'all') {
        queryBuilder.andWhere('member.status = :status', { status });
      }

      const [data, total] = await queryBuilder
        .orderBy('member.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

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
    } catch (error) {
      this.logger.error(`Erreur getAllMembers: ${error.message}`);
      return { data: [], total: 0, page: 1, totalPages: 0, limit };
    }
  }

  // ============================================================
  // RECUPERATION D UN MEMBRE PAR ID
  // ============================================================

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

  // ============================================================
  // RECUPERATION D UN MEMBRE PAR USER ID
  // ============================================================

  async getMemberByUserId(userId: string) {
    const member = await this.memberRepository.findOne({
      where: { userId, status: MembershipStatus.ACTIVE },
      relations: ['user'],
    });
    return member || null;
  }

  // ============================================================
  // MISE A JOUR DU STATUT
  // ============================================================

  async updateMemberStatus(id: string, status: string) {
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('Adhesion non trouvee');
    }
    
    member.status = status;
    await this.memberRepository.save(member);
    this.logger.log(`Statut de l adhesion ${id} mis a jour: ${status}`);
    
    return { success: true, message: 'Statut mis a jour' };
  }

  // ============================================================
  // STATISTIQUES DES MEMBRES
  // ============================================================

  async getStats() {
    const queryBuilder = this.memberRepository
      .createQueryBuilder('member')
      .leftJoin('member.user', 'user')
      .where('user.role != :superAdminRole', { superAdminRole: 'super_admin' })
      .andWhere('user.role != :adminRole', { adminRole: 'admin' });

    const total = await queryBuilder.getCount();
    const active = await queryBuilder.clone().andWhere('member.status = :status', { status: MembershipStatus.ACTIVE }).getCount();
    const expired = await queryBuilder.clone().andWhere('member.status = :status', { status: MembershipStatus.EXPIRED }).getCount();
    const pending = await queryBuilder.clone().andWhere('member.status = :status', { status: MembershipStatus.PENDING }).getCount();
    const suspended = await queryBuilder.clone().andWhere('member.status = :status', { status: MembershipStatus.SUSPENDED }).getCount();
    
    const revenueResult = await queryBuilder.clone().select('SUM(member.amountPaid)', 'total').getRawOne();
    const totalRevenue = revenueResult?.total || 0;

    return { total, active, expired, pending, suspended, totalRevenue };
  }

  // ============================================================
  // RECUPERATION DE LA CARTE MEMBRE
  // ============================================================

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
        this.logger.log(`Carte generee a la demande pour ${memberNumber}`);
      } catch (error) {
        this.logger.error(`Erreur generation carte: ${error.message}`);
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

  // ============================================================
  // SUPPRESSION D UN MEMBRE
  // ============================================================

  async deleteMember(id: string) {
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('Adhesion non trouvee');
    }
    
    // Supprimer le fichier sur Cloudinary si existant
    if (member.cardUrl) {
      try {
        const publicId = member.cardUrl.split('/').slice(-2).join('/').replace('.pdf', '');
        await this.uploadService.deleteFromCloudinary(publicId);
        this.logger.log(`Fichier Cloudinary supprime: ${publicId}`);
      } catch (error) {
        this.logger.error(`Erreur suppression fichier Cloudinary: ${error.message}`);
      }
    }
    
    await this.memberRepository.remove(member);
    this.logger.log(`Adhesion ${id} supprimee`);
    
    return { success: true, message: 'Adhesion supprimee' };
  }

  // ============================================================
  // METHODES PRIVEES
  // ============================================================

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