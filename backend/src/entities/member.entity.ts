import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

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
@Index(['userId', 'status'])
@Index(['memberNumber'])
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'memberNumber', unique: true, length: 50 })
  memberNumber: string;

  @Column({ name: 'userId' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ 
    type: 'varchar', 
    length: 20,
    default: MembershipStatus.PENDING 
  })
  status: string;

  @Column({ 
    name: 'membershipType', 
    type: 'varchar', 
    length: 20
  })
  membershipType: string;

  @Column({ 
    name: 'startDate', 
    type: 'date'
  })
  startDate: Date;

  @Column({ 
    name: 'expiryDate', 
    type: 'date'
  })
  expiryDate: Date;

  @Column({ 
    name: 'amountPaid', 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0 
  })
  amountPaid: number;

  @Column({ 
    name: 'paymentMethod', 
    length: 50, 
    nullable: true 
  })
  paymentMethod: string;

  @Column({ 
    name: 'transactionId', 
    length: 255, 
    nullable: true 
  })
  transactionId: string;

  @Column({ 
    name: 'cardUrl', 
    type: 'text', 
    nullable: true 
  })
  cardUrl: string;

  @Column({ 
    name: 'qrCode', 
    type: 'text', 
    nullable: true 
  })
  qrCode: string;

  @Column({ 
    name: 'qrCodeData', 
    type: 'text', 
    nullable: true 
  })
  qrCodeData: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}