import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('job_offers')
export class JobOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  titleMg: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  descriptionMg: string;

  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ name: 'company_logo', nullable: true })
  companyLogo: string;

  @Column({ name: 'company_website', nullable: true })
  companyWebsite: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  region: string;

  @Column({ name: 'job_type', default: 'cdi' })
  jobType: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ name: 'salary_range', nullable: true })
  salaryRange: string;

  @Column({ name: 'experience_required', nullable: true })
  experienceRequired: string;

  @Column({ name: 'education_required', nullable: true })
  educationRequired: string;

  @Column('text', { nullable: true })
  requirements: string;

  @Column('text', { nullable: true })
  requirementsMg: string;

  @Column('text', { nullable: true })
  benefits: string;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ default: 'draft' })
  status: string;

  @Column({ name: 'applications_count', default: 0 })
  applicationsCount: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}