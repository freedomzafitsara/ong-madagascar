import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// ✅ Exporter les enums
export enum DonationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentProvider {
  MVOLA = 'mvola',
  ORANGE_MONEY = 'orange_money',
  AIRTEL_MONEY = 'airtel_money',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
}

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'MGA' })
  currency: string;

  @Column({ name: 'payment_provider' })
  paymentProvider: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;

  @Column({ name: 'mvola_transaction_id', nullable: true })
  mvolaTransactionId: string;

  @Column({ name: 'orange_transaction_id', nullable: true })
  orangeTransactionId: string;

  @Column({ type: 'varchar', default: DonationStatus.PENDING })
  status: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @Column({ name: 'donor_name', nullable: true })
  donorName: string;

  @Column({ name: 'donor_email', nullable: true })
  donorEmail: string;

  @Column({ name: 'donor_phone', nullable: true })
  donorPhone: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ name: 'is_anonymous', default: false })
  isAnonymous: boolean;

  @Column({ name: 'is_recurring', default: false })
  isRecurring: boolean;

  @Column({ name: 'recurring_interval', nullable: true })
  recurringInterval: string;

  @Column({ name: 'receipt_url', nullable: true })
  receiptUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}