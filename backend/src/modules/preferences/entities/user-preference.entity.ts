// backend/src/modules/preferences/entities/user-preference.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../entities/user.entity';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 10, default: 'fr' })
  language: string;

  @Column({ type: 'varchar', length: 50, default: 'Indian/Antananarivo' })
  timezone: string;

  @Column({ type: 'varchar', length: 20, default: 'light' })
  theme: string;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  font_size: string;

  @Column({ type: 'boolean', default: false })
  sidebar_collapsed: boolean;

  @Column({ type: 'boolean', default: true })
  animations_enabled: boolean;

  @Column({ type: 'varchar', length: 20, default: 'comfortable' })
  density: string;

  @Column({ type: 'boolean', default: true })
  email_notifications: boolean;

  @Column({ type: 'boolean', default: true })
  push_notifications: boolean;

  @Column({ type: 'boolean', default: true })
  job_alerts: boolean;

  @Column({ type: 'boolean', default: true })
  project_updates: boolean;

  @Column({ type: 'boolean', default: false })
  blog_updates: boolean;

  @Column({ type: 'boolean', default: true })
  system_updates: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}