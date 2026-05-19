import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation, DonationStatus, PaymentProvider } from '../../entities/donation.entity';
import { CreateDonationDto, ConfirmDonationDto } from './dto/create-donation.dto';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
  ) {}

  async create(createDonationDto: CreateDonationDto, userId?: string): Promise<Donation> {
    try {
      const donation = this.donationRepository.create({
        ...createDonationDto,
        user_id: userId,
        status: DonationStatus.PENDING,
        transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      });
      
      return await this.donationRepository.save(donation);
    } catch (error) {
      throw new BadRequestException('Erreur lors de la création du don');
    }
  }

  async confirm(confirmDto: ConfirmDonationDto): Promise<Donation> {
    const donation = await this.donationRepository.findOne({
      where: { transaction_id: confirmDto.transaction_id }
    });

    if (!donation) {
      throw new NotFoundException('Don non trouvé');
    }

    donation.status = DonationStatus.COMPLETED;
    donation.receipt_url = `/receipts/${donation.id}.pdf`;
    
    return await this.donationRepository.save(donation);
  }

  async findAll(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const query = this.donationRepository.createQueryBuilder('donation');

    if (status) {
      query.andWhere('donation.status = :status', { status });
    }

    const [data, total] = await query
      .orderBy('donation.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, totalPages: Math.ceil(total / limit), limit };
  }

  async findOne(id: string): Promise<Donation> {
    const donation = await this.donationRepository.findOne({ where: { id } });
    if (!donation) {
      throw new NotFoundException('Don non trouvé');
    }
    return donation;
  }

  async getUserDonations(userId: string) {
    return this.donationRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async getStats() {
    const total = await this.donationRepository.count();
    const completed = await this.donationRepository.count({ where: { status: DonationStatus.COMPLETED } });
    const totalAmount = await this.donationRepository
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'total')
      .where('donation.status = :status', { status: DonationStatus.COMPLETED })
      .getRawOne();
    
    return { 
      total, 
      completed, 
      totalAmount: totalAmount?.total || 0 
    };
  }
}