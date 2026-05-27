// backend/src/entities/project.entity.ts

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

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PLANNING = 'planning',
  DRAFT = 'draft'
}

@Entity('projects')
@Index(['status', 'region'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'title_mg', length: 255, nullable: true })
  title_mg: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'description_mg', type: 'text', nullable: true })
  description_mg: string;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ length: 100 })
  category: string;

  @Column({ length: 100 })
  region: string;

  @Column({ 
    type: 'enum', 
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING
  })
  status: ProjectStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spent: number;

  @Column({ name: 'beneficiaries_count', default: 0 })
  beneficiaries_count: number;

  @Column({ name: 'youth_impact', default: 0 })
  youth_impact: number;

  @Column({ name: 'jobs_created', default: 0 })
  jobs_created: number;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  start_date: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  end_date: Date;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  image_url: string;

  @Column({ name: 'gallery_images', type: 'text', array: true, default: {} })
  gallery_images: string[];

  @Column({ name: 'is_featured', default: false })
  is_featured: boolean;

  @Column({ name: 'manager_id', nullable: true })
  manager_id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'manager_id' })
  manager: User;
}