// backend/src/entities/donation.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index 
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';

export enum DonationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentProvider {
  MVOLA = 'mvola',
  ORANGE_MONEY = 'orange_money',
  AIRTEL = 'airtel',
  PAYPAL = 'paypal',
  BANK = 'bank',
  CASH = 'cash'
}

export enum RecurringInterval {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

@Entity('donations')
@Index(['status', 'created_at'])
@Index(['payment_provider'])
@Index(['user_id'])
@Index(['project_id'])
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ length: 10, default: 'MGA' })
  currency: string;

  @Column({ name: 'payment_provider', length: 50 })
  payment_provider: PaymentProvider;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phone_number: string;

  @Column({ name: 'transaction_id', length: 255, nullable: true })
  transaction_id: string;

  @Column({ name: 'mvola_transaction_id', length: 255, nullable: true })
  mvola_transaction_id: string;

  @Column({ name: 'orange_transaction_id', length: 255, nullable: true })
  orange_transaction_id: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    default: DonationStatus.PENDING
  })
  status: DonationStatus;

  @Column({ name: 'user_id', nullable: true })
  user_id: string;

  @Column({ name: 'project_id', nullable: true })
  project_id: string;

  @Column({ name: 'donor_name', length: 255, nullable: true })
  donor_name: string;

  @Column({ name: 'donor_email', length: 255, nullable: true })
  donor_email: string;

  @Column({ name: 'donor_phone', length: 50, nullable: true })
  donor_phone: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ name: 'is_anonymous', default: false })
  is_anonymous: boolean;

  @Column({ name: 'is_recurring', default: false })
  is_recurring: boolean;

  @Column({ name: 'recurring_interval', length: 50, nullable: true })
  recurring_interval: RecurringInterval;

  @Column({ name: 'receipt_url', type: 'text', nullable: true })
  receipt_url: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;
}