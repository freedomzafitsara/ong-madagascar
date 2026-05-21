import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Event } from './event.entity';
import { User } from './user.entity';

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  ATTENDED = 'attended'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

@Entity('event_registrations')
@Index(['eventId', 'email'])
@Index(['eventId', 'status'])
@Index(['createdAt'])
export class EventRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ name: 'payment_method', length: 50, nullable: true })
  paymentMethod: string;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'varchar', length: 50, default: RegistrationStatus.PENDING })
  status: string;

  @Column({ name: 'payment_status', type: 'varchar', length: 50, default: PaymentStatus.PENDING })
  paymentStatus: string;

  @Column({ name: 'qr_code', type: 'text', nullable: true })
  qrCode: string;

  @Column({ name: 'qr_code_data', type: 'text', nullable: true })
  qrCodeData: string;

  @Column({ name: 'checked_in', default: false })
  checkedIn: boolean;

  @Column({ name: 'checked_in_at', type: 'timestamp', nullable: true })
  checkedInAt: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Event, (event) => event.registrations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}