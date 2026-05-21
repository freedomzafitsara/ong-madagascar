import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn, 
  OneToMany,
  Index 
} from 'typeorm';
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
@Index(['status', 'deadline'])
@Index(['is_featured', 'status'])
export class JobOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, name: 'title_mg', nullable: true })
  title_mg: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', name: 'description_mg', nullable: true })
  description_mg: string;

  @Column({ length: 255, name: 'company_name' })
  company_name: string;

  @Column({ length: 500, name: 'company_logo', nullable: true })
  company_logo: string;

  @Column({ length: 255, name: 'company_website', nullable: true })
  company_website: string;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ length: 100, nullable: true })
  region: string;

  @Column({ type: 'varchar', length: 50, name: 'job_type' })
  job_type: string;

  @Column({ length: 100, nullable: true })
  sector: string;

  @Column({ length: 100, nullable: true })
  salary: string;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ type: 'text', name: 'requirements_mg', nullable: true })
  requirements_mg: string;

  @Column({ type: 'text', nullable: true })
  benefits: string;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: JobStatus.DRAFT 
  })
  status: string;

  @Column({ name: 'applications_count', default: 0 })
  applications_count: number;

  @Column({ name: 'is_featured', default: false })
  is_featured: boolean;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  created_by: string;

  @Column({ length: 255, name: 'contact_email', nullable: true })
  contact_email: string;

  @Column({ length: 50, name: 'contact_phone', nullable: true })
  contact_phone: string;

  @Column({ length: 500, name: 'image_url', nullable: true })
  image_url: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => JobApplication, (application) => application.jobOffer, { cascade: true })
  applications: JobApplication[];
}