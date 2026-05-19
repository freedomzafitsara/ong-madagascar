// backend/src/entities/event-registration.entity.ts
// VERSION CORRIGEE AVEC L'ENUM

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';
import { User } from './user.entity';

// Ajouter l'enum RegistrationStatus
export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  WAITING = 'waiting'
}

@Entity('event_registrations')
export class EventRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'eventId', type: 'uuid' })
  eventId: string;

  @Column({ name: 'userId', type: 'uuid' })
  userId: string;

  @Column({ 
    type: 'enum', 
    enum: RegistrationStatus, 
    default: RegistrationStatus.CONFIRMED 
  })
  status: RegistrationStatus;

  @Column({ name: 'qrCode', type: 'text', nullable: true })
  qrCode: string;

  @Column({ name: 'ticketNumber', type: 'varchar', length: 100, nullable: true })
  ticketNumber: string;

  @Column({ name: 'registeredAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registeredAt: Date;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}