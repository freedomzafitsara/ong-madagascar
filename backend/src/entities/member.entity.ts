import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// ✅ Exporter les enums
export enum MembershipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
}

export enum MembershipType {
  STANDARD = 'standard',
  PREMIUM = 'premium',
  STUDENT = 'student',
  HONORARY = 'honorary',
}

export enum PaymentMethod {
  MVOLA = 'mvola',
  ORANGE_MONEY = 'orange_money',
  AIRTEL = 'airtel',
  BANK = 'bank',
}

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'memberNumber', unique: true })
  memberNumber: string;

  @Column({ name: 'userId' })
  userId: string;

  @Column({ type: 'varchar', default: MembershipStatus.PENDING })
  status: string;

  @Column({ name: 'membershipType', type: 'varchar' })
  membershipType: string;

  @Column({ name: 'startDate', type: 'date' })
  startDate: Date;

  @Column({ name: 'expiryDate', type: 'date' })
  expiryDate: Date;

  @Column({ name: 'amountPaid', type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ name: 'paymentMethod', nullable: true })
  paymentMethod: string;

  @Column({ name: 'transactionId', nullable: true })
  transactionId: string;

  @Column({ name: 'cardUrl', nullable: true, type: 'text' })
  cardUrl: string;

  @Column({ name: 'qrCode', nullable: true, type: 'text' })
  qrCode: string;

  @Column({ name: 'qrCodeData', nullable: true, type: 'text' })
  qrCodeData: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}