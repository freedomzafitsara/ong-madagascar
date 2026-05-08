import { 
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, 
  ManyToOne, JoinColumn, Index 
} from 'typeorm';
import { JobOffer } from './job-offer.entity';

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  REVIEWING = 'reviewing',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('job_applications')
@Index(['email'])
@Index(['status'])
@Index(['jobOfferId', 'email'], { unique: true })
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_offer_id' })
  jobOfferId: string;

  @ManyToOne(() => JobOffer)
  @JoinColumn({ name: 'job_offer_id' })
  jobOffer: JobOffer;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column('text')
  address: string;

  @Column('text', { nullable: true })
  experience: string;

  @Column('text', { nullable: true })
  cover_letter: string;

  @Column({ nullable: true })
  photo_url: string;

  @Column()
  cv_url: string;

  @Column({ nullable: true })
  diploma_url: string;

  @Column({ nullable: true })
  attestation_url: string;

  @Column({ type: 'varchar', default: ApplicationStatus.SUBMITTED })
  status: string;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}