// backend/src/entities/job-application.entity.ts

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
import { JobOffer } from './job-offer.entity';

export type ApplicationStatus = 'submitted' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected';

@Entity('job_applications')
@Index(['email', 'job_offer_id'], { unique: true })
@Index(['status'])
@Index(['created_at'])
@Index(['job_offer_id'])
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_offer_id', type: 'uuid' })
  job_offer_id: string;

  @Column({ name: 'full_name', length: 255 })
  full_name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ name: 'cv_url', length: 500, nullable: true })
  cv_url: string;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  cover_letter: string;

  @Column({ default: 'submitted' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => JobOffer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_offer_id' })
  jobOffer: JobOffer;
}