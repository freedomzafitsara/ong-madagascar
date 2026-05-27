// backend/src/modules/payments/paypal-sandbox.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PayPalSandboxService {
  private readonly logger = new Logger(PayPalSandboxService.name);

  async createDonationOrder(amount: number, currency: string = 'EUR', description: string = 'Don à Y-Mad'): Promise<any> {
    this.logger.log(`Création d'un don Sandbox: ${amount} ${currency}`);
    
    const orderId = `SANDBOX-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    return {
      id: orderId,
      status: 'CREATED',
      links: [{ href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`, rel: 'approve', method: 'GET' }]
    };
  }

  async captureDonation(orderId: string): Promise<any> {
    this.logger.log(`Capture d'un don Sandbox: ${orderId}`);
    return {
      id: orderId,
      status: 'COMPLETED',
      message: 'Paiement simulé avec succès - Aucun argent réel n\'a été débité'
    };
  }

  getTestCredentials(): any {
    return {
      mode: 'sandbox',
      message: 'Mode test PayPal - Aucun compte réel requis',
      test_accounts: {
        buyer: { email: 'sb-7qk2p26327806@personal.example.com', password: 'test123' }
      },
      test_cards: [
        { type: 'Visa', number: '4111 1111 1111 1111', expiry: '12/25', cvv: '123' }
      ]
    };
  }
}