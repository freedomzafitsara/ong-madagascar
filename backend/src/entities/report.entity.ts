// backend/src/entities/report.entity.ts

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

export type ReportType = 'activity' | 'financial' | 'impact' | 'beneficiaries' | 'volunteers' | 'jobs' | 'donations';
export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

@Entity('reports')
@Index(['type', 'created_at'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  type: ReportType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 20, default: 'month' })
  period: ReportPeriod;

  @Column({ name: 'period_start', type: 'date', nullable: true })
  period_start: Date;

  @Column({ name: 'period_end', type: 'date', nullable: true })
  period_end: Date;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ type: 'jsonb', nullable: true })
  stats: any;

  @Column({ name: 'file_url', type: 'text', nullable: true })
  file_url: string;

  @Column({ name: 'created_by', nullable: true })
  created_by: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}