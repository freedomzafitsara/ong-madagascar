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

  @Column({ default: 'planning' })
  status: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  start_date: Date;

  @Column({ name: 'image_url', nullable: true })
  image_url: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}