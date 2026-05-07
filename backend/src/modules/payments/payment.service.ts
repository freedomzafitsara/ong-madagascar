// backend/src/modules/payments/payments.service.ts (à compléter)
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PaymentsService {
  constructor(private httpService: HttpService) {}

  async processMVolaPayment(phoneNumber: string, amount: number, reference: string) {
    // Intégration API MVola
    const response = await this.httpService.post(`${process.env.MVOLA_API_URL}/payment`, {
      phone_number: phoneNumber,
      amount: amount,
      currency: 'MGA',
      reference: reference
    }).toPromise();
    return response.data;
  }

  async processOrangeMoneyPayment(phoneNumber: string, amount: number, reference: string) {
    // Intégration Orange Money
    // ...
  }

  async processAirtelMoneyPayment(phoneNumber: string, amount: number, reference: string) {
    // Intégration Airtel Money
    // ...
  }
}