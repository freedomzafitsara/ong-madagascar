import { PaymentProvider } from '../../../entities/donation.entity';

export class CreateDonationDto {
  amount: number;
  currency?: string;
  payment_provider: PaymentProvider;
  phone_number?: string;
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  message?: string;
  is_anonymous?: boolean;
  is_recurring?: boolean;
  recurring_interval?: string;
  project_id?: string;
}

export class ConfirmDonationDto {
  transaction_id: string;
  provider: string;
}