import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { JobOffer } from './job-offer.entity';
import { User } from './user.entity';

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  REVIEWING = 'reviewing',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  jobOfferId: string;

  @ManyToOne(() => JobOffer)
  @JoinColumn({ name: 'jobOfferId' })
  jobOffer: JobOffer;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column('text')
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  experience: string;

  @Column('text', { nullable: true })
  coverLetter: string;

  @Column({ nullable: true })
  cvUrl: string;

  @Column({ nullable: true })
  diplomaUrl: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ type: 'varchar', default: ApplicationStatus.SUBMITTED })
  status: string;

  @CreateDateColumn()
  appliedAt: Date;
}