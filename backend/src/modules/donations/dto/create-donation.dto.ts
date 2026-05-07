export class CreateDonationDto {
  amount: number;
  paymentProvider: string;
  phoneNumber?: string;
  projectId?: string | null;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  message?: string;
  isAnonymous?: boolean;
  isRecurring?: boolean;
}

export class ConfirmPaymentDto {
  transactionId: string;
  reference?: string;
}