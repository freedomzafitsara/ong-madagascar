import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('projects')
export class Project {
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

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  region: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budget: number;

  @Column({ default: 0 })
  beneficiaries_count: number;

  @Column({ default: 0 })
  youth_impact: number;

  @Column({ default: 0 })
  jobs_created: number;

  @Column({ default: 0 })
  progress: number;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ nullable: true })
  image_url: string;

  @Column('text', { array: true, nullable: true })
  gallery_images: string[];

  @Column({ default: false })
  is_featured: boolean;

  @Column({ nullable: true })
  manager_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}