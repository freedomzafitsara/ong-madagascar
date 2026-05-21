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
import { User } from './user.entity';

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  REVIEWING = 'reviewing',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

@Entity('job_applications')
@Index(['email', 'job_offer_id'], { unique: true })
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'job_offer_id' })
  job_offer_id: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  user_id: string;

  @Column({ length: 255, name: 'full_name' })
  full_name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'int', name: 'experience_years', nullable: true })
  experience_years: number;

  @Column({ type: 'text', name: 'cover_letter', nullable: true })
  cover_letter: string;

  @Column({ length: 500, name: 'photo_url', nullable: true })
  photo_url: string;

  @Column({ length: 500, name: 'cv_url' })
  cv_url: string;

  @Column({ length: 500, name: 'diploma_url', nullable: true })
  diploma_url: string;

  @Column({ length: 500, name: 'attestation_url', nullable: true })
  attestation_url: string;

  @Column({ 
    type: 'enum', 
    enum: ApplicationStatus, 
    default: ApplicationStatus.SUBMITTED 
  })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', name: 'reviewed_by', nullable: true })
  reviewed_by: string;

  @Column({ type: 'timestamp', name: 'reviewed_at', nullable: true })
  reviewed_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => JobOffer, (offer) => offer.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_offer_id' })
  jobOffer: JobOffer;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;
}