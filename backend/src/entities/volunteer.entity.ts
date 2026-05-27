// backend/src/entities/volunteer.entity.ts - Ajouter photo_url

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

export enum VolunteerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum AvailabilityType {
  WEEKEND = 'weekend',
  WEEKDAY = 'weekday',
  BOTH = 'both'
}

@Entity('volunteers')
@Index(['status', 'region'])
@Index(['email'])
export class Volunteer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  user_id: string;

  @Column({ name: 'first_name', length: 100 })
  first_name: string;

  @Column({ name: 'last_name', length: 100 })
  last_name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photo_url: string;

  @Column({ type: 'text', array: true, default: {} })
  skills: string[];

  @Column({ length: 100 })
  region: string;

  @Column({ type: 'text', nullable: true })
  availability: string;

  @Column({ 
    type: 'enum', 
    enum: AvailabilityType, 
    name: 'availability_type',
    default: AvailabilityType.BOTH
  })
  availability_type: AvailabilityType;

  @Column({ type: 'int', default: 0 })
  hours: number;

  @Column({ 
    type: 'enum', 
    enum: VolunteerStatus, 
    default: VolunteerStatus.ACTIVE
  })
  status: VolunteerStatus;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}