import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  WAITING = 'waiting',
}

@Entity('event_registrations')
export class EventRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', default: RegistrationStatus.PENDING })
  status: string;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ nullable: true })
  ticketNumber: string;

  @CreateDateColumn()
  registeredAt: Date;
}