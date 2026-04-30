import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('projects')
export class Project {
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

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budget: number;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: 0 })
  progress: number;

  @Column({ default: 'planning' })
  status: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'gallery_images', type: 'text', array: true, nullable: true })
  galleryImages: string[];

  @Column({ name: 'youth_impact', default: 0 })
  youthImpact: number;

  @Column({ name: 'jobs_created', default: 0 })
  jobsCreated: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}