import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
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
  AIRTEL_MONEY = 'airtel_money',
  BANK = 'bank',
  PAYPAL = 'paypal'
}

@Entity('donations')
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ length: 10, default: 'MGA' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentProvider })
  payment_provider: PaymentProvider;

  @Column({ length: 20, nullable: true })
  phone_number: string;

  @Column({ length: 255, nullable: true })
  transaction_id: string;

  @Column({ type: 'enum', enum: DonationStatus, default: DonationStatus.PENDING })
  status: DonationStatus;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  project_id: string;

  @Column({ length: 255, nullable: true })
  donor_name: string;

  @Column({ length: 255, nullable: true })
  donor_email: string;

  @Column({ length: 50, nullable: true })
  donor_phone: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ default: false })
  is_anonymous: boolean;

  @Column({ default: false })
  is_recurring: boolean;

  @Column({ length: 50, nullable: true })
  recurring_interval: string;

  @Column({ type: 'text', nullable: true })
  receipt_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;
}