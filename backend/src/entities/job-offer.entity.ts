import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { JobApplication } from './job-application.entity';

export enum JobType {
  CDI = 'cdi',
  CDD = 'cdd',
  STAGE = 'stage',
  FREELANCE = 'freelance',
  BENEVOLAT = 'benevolat'
}

export enum JobStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  EXPIRED = 'expired'
}

@Entity('job_offers')
export class JobOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, nullable: true })
  title_mg: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  description_mg: string;

  @Column({ length: 255 })
  company_name: string;

  @Column({ length: 500, nullable: true })
  company_logo: string;

  @Column({ length: 255, nullable: true })
  company_website: string;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ length: 100, nullable: true })
  region: string;

  @Column({ type: 'varchar', length: 50 })
  job_type: string;

  @Column({ length: 100, nullable: true })
  sector: string;

  @Column({ length: 100, nullable: true })
  salary: string;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ type: 'text', nullable: true })
  requirements_mg: string;

  @Column({ type: 'text', nullable: true })
  benefits: string;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: string;

  @Column({ default: 0 })
  applications_count: number;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ length: 255, nullable: true })
  contact_email: string;

  @Column({ length: 50, nullable: true })
  contact_phone: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => JobApplication, (application) => application.jobOffer)
  applications: JobApplication[];
  @Column({ length: 500, nullable: true })
image_url: string;  // ← Image de couverture de l'offre
}