// backend/src/modules/donations/donations.service.ts

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation, DonationStatus, PaymentProvider } from '../../entities/donation.entity';
import { CreateDonationDto, UpdateDonationStatusDto } from './dto/create-donation.dto';

@Injectable()
export class DonationsService {
  private readonly logger = new Logger(DonationsService.name);

  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
  ) {}

  private generateReceiptNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `YM-DON-${year}${month}${day}-${random}`;
  }

  async create(createDto: CreateDonationDto, userId?: string): Promise<Donation> {
    const donation = this.donationRepository.create({
      amount: createDto.amount,
      currency: createDto.currency || 'MGA',
      payment_provider: createDto.payment_provider,
      phone_number: createDto.phone_number,
      donor_name: createDto.donor_name,
      donor_email: createDto.donor_email,
      donor_phone: createDto.donor_phone,
      project_id: createDto.project_id,
      message: createDto.message,
      is_anonymous: createDto.is_anonymous || false,
      is_recurring: createDto.is_recurring || false,
      recurring_interval: createDto.recurring_interval,
      user_id: userId || null,
      status: DonationStatus.PENDING,
    });

    const saved = await this.donationRepository.save(donation);
    this.logger.log(`Don créé: ${saved.id} - ${saved.amount} ${saved.currency}`);
    return saved;
  }

  async findAll(): Promise<Donation[]> {
    return this.donationRepository.find({
      relations: ['user', 'project'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Donation> {
    const donation = await this.donationRepository.findOne({
      where: { id },
      relations: ['user', 'project'],
    });
    if (!donation) {
      throw new NotFoundException(`Don avec l'id ${id} non trouvé`);
    }
    return donation;
  }

  async updateStatus(id: string, updateDto: UpdateDonationStatusDto): Promise<Donation> {
    const donation = await this.findOne(id);
    donation.status = updateDto.status;
    if (updateDto.notes) {
      donation.message = updateDto.notes;
    }
    return this.donationRepository.save(donation);
  }

  async getStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    failed: number;
    total_amount: number;
    monthly_amount: number;
  }> {
    const [total, completed, pending, failed, totalAmountResult, monthlyAmountResult] = await Promise.all([
      this.donationRepository.count(),
      this.donationRepository.count({ where: { status: DonationStatus.COMPLETED } }),
      this.donationRepository.count({ where: { status: DonationStatus.PENDING } }),
      this.donationRepository.count({ where: { status: DonationStatus.FAILED } }),
      this.donationRepository
        .createQueryBuilder('d')
        .select('SUM(d.amount)', 'total')
        .where('d.status = :status', { status: DonationStatus.COMPLETED })
        .getRawOne(),
      this.donationRepository
        .createQueryBuilder('d')
        .select('SUM(d.amount)', 'total')
        .where('d.status = :status', { status: DonationStatus.COMPLETED })
        .andWhere('EXTRACT(MONTH FROM d.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)')
        .getRawOne(),
    ]);

    return {
      total,
      completed,
      pending,
      failed,
      total_amount: parseFloat(totalAmountResult?.total || 0),
      monthly_amount: parseFloat(monthlyAmountResult?.total || 0),
    };
  }

  async remove(id: string): Promise<void> {
    const donation = await this.findOne(id);
    await this.donationRepository.remove(donation);
    this.logger.log(`Don supprimé: ${id}`);
  }
}