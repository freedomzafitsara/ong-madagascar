import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum JobType {
  CDI = 'cdi',
  CDD = 'cdd',
  STAGE = 'stage',
  FREELANCE = 'freelance',
  BENEVOLAT = 'benevolat',
}

export enum JobStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  EXPIRED = 'expired',
}

@Entity('job_offers')
export class JobOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_mg: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  description_mg: string;

  @Column({ name: 'company_name' })  // ← CORRIGÉ : snake_case
  companyName: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  region: string;

  @Column({ name: 'job_type' })  // ← CORRIGÉ : snake_case
  jobType: string;

  @Column({ nullable: true })
  salary: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ type: 'varchar', default: JobStatus.DRAFT })
  status: string;

  @Column({ name: 'applications_count', default: 0 })  // ← CORRIGÉ : snake_case
  applicationsCount: number;

  @Column({ name: 'is_featured', default: false })  // ← CORRIGÉ : snake_case
  isFeatured: boolean;

  @Column({ name: 'created_by', nullable: true })  // ← CORRIGÉ : snake_case
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}