import { 
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, 
  UpdateDateColumn, ManyToOne, JoinColumn, Index 
} from 'typeorm';
import { User } from './user.entity';

export enum JobType {
  CDI = 'cdi',
  CDD = 'cdd',
  STAGE = 'stage',
  FREELANCE = 'freelance',
  VOLUNTEER = 'volunteer',
}

export enum JobStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  EXPIRED = 'expired',
}

@Entity('job_offers')
@Index(['status'])
@Index(['jobType'])
@Index(['sector'])
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

  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  region: string;

  // ✅ CORRECTION : Utiliser le nom exact de la colonne dans la base
  @Column({ name: 'job_type', type: 'varchar', default: JobType.CDI })
  jobType: string;

  @Column({ nullable: true })
  salary: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ nullable: true })
  contact_email: string;

  @Column({ nullable: true })
  contact_phone: string;

  @Column({ type: 'date' })
  deadline: Date;

  @Column({ type: 'varchar', default: JobStatus.DRAFT })
  status: string;

  @Column({ default: 0 })
  applications_count: number;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}