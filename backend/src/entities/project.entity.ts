import { 
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, 
  UpdateDateColumn, ManyToOne, JoinColumn, Index 
} from 'typeorm';
import { User } from './user.entity';

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

@Entity('projects')
@Index(['status'])
@Index(['region'])
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

  @Column({ type: 'varchar', default: ProjectStatus.ACTIVE })
  status: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budget: number;

  // ✅ SUPPRIMER "spent" ou le garder avec name
  @Column({ name: 'spent', type: 'decimal', precision: 15, scale: 2, default: 0, nullable: true })
  spent: number;

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

  @Column('simple-array', { nullable: true })
  gallery_images: string[];

  @Column({ default: false })
  is_featured: boolean;

  @Column({ name: 'manager_id', type: 'uuid', nullable: true })
  managerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}