// backend/src/entities/project.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index 
} from 'typeorm';

export type ProjectStatus = 'active' | 'completed' | 'planning' | 'draft';

@Entity('projects')
@Index(['status'])
@Index(['region'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title_fr', length: 255 })
  title_fr: string;

  @Column({ name: 'title_mg', length: 255, nullable: true })
  title_mg: string;

  @Column({ name: 'description_fr', type: 'text' })
  description_fr: string;

  @Column({ name: 'description_mg', type: 'text', nullable: true })
  description_mg: string;

  @Column({ nullable: true })
  location: string;

  // AJOUTER CETTE COLONNE
  @Column({ nullable: true })
  region: string;

  @Column({ default: 'planning' })
  status: string;

  @Column({ type: 'int', default: 0 })
  budget: number;

  @Column({ type: 'int', default: 0 })
  spent: number;

  @Column({ name: 'beneficiaries_count', type: 'int', default: 0 })
  beneficiaries_count: number;

  @Column({ name: 'youth_impact', type: 'int', default: 0 })
  youth_impact: number;

  @Column({ name: 'jobs_created', type: 'int', default: 0 })
  jobs_created: number;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  start_date: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  end_date: Date;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ name: 'image_url', nullable: true })
  image_url: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}