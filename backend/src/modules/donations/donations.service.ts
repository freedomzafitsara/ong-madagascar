import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from '../../entities/donation.entity';
import { CreateDonationDto, ConfirmPaymentDto } from './dto/create-donation.dto';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
  ) {}

  async createDonation(userId: string | null, createDonationDto: CreateDonationDto) {
    const transactionId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const donation = this.donationRepository.create({
      amount: createDonationDto.amount,
      currency: 'MGA',
      paymentProvider: createDonationDto.paymentProvider,
      phoneNumber: createDonationDto.phoneNumber,
      transactionId,
      status: 'pending',
      userId: userId,
      projectId: createDonationDto.projectId,
      donorName: createDonationDto.donorName,
      donorEmail: createDonationDto.donorEmail,
      donorPhone: createDonationDto.donorPhone,
      message: createDonationDto.message,
      isAnonymous: createDonationDto.isAnonymous || false,
      isRecurring: createDonationDto.isRecurring || false,
    });

    const savedDonation = await this.donationRepository.save(donation);

    return {
      success: true,
      message: 'Don créé avec succès',
      donation: {
        id: savedDonation.id,
        amount: savedDonation.amount,
        paymentProvider: savedDonation.paymentProvider,
        transactionId: savedDonation.transactionId,
        status: savedDonation.status,
      },
    };
  }

  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto) {
    const donation = await this.donationRepository.findOne({
      where: { transactionId: confirmPaymentDto.transactionId },
    });
    if (!donation) {
      throw new Error('Don non trouvé');
    }
    donation.status = 'completed';
    await this.donationRepository.save(donation);
    return { success: true, message: 'Paiement confirmé' };
  }

  async getDonationById(id: string) {
    return this.donationRepository.findOne({ where: { id } });
  }

  async getUserDonations(userId: string) {
    return this.donationRepository.find({ where: { userId, status: 'completed' } });
  }

  async getAllDonations() {
    return this.donationRepository.find();
  }

  async getStats() {
    const total = await this.donationRepository.count();
    const result = await this.donationRepository
      .createQueryBuilder('donation')
      .select('SUM(donation.amount)', 'total')
      .getRawOne();
    return { total, totalAmount: parseFloat(result?.total) || 0 };
  }
}