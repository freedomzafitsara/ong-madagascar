// backend/src/entities/user.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  CANDIDATE = 'candidate',
  VISITOR = 'visitor',
}

@Entity('users')
@Index(['email'])
@Index(['role'])
@Index(['is_active'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100 })
  first_name: string;

  @Column({ name: 'last_name', length: 100 })
  last_name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ select: false, length: 255 })
  password: string;

  @Column({ 
    type: 'varchar', 
    length: 20,
    default: UserRole.CANDIDATE 
  })
  role: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'last_login', nullable: true })
  last_login: Date;

  @Column({ name: 'avatar_url', nullable: true })
  avatar_url: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'reset_token', nullable: true })
  reset_token: string;

  @Column({ name: 'reset_token_expires', nullable: true })
  reset_token_expires: Date;

  // Preferences
  @Column({ name: 'preferred_language', default: 'fr' })
  preferred_language: string;

  @Column({ default: 'light' })
  theme: string;

  @Column({ name: 'font_size', default: 'medium' })
  font_size: string;

  @Column({ default: 'comfortable' })
  density: string;

  @Column({ name: 'sidebar_collapsed', default: false })
  sidebar_collapsed: boolean;

  @Column({ name: 'animations_enabled', default: true })
  animations_enabled: boolean;

  @Column({ default: 'Indian/Antananarivo' })
  timezone: string;

  @Column({ name: 'email_notifications', default: true })
  email_notifications: boolean;

  @Column({ name: 'push_notifications', default: true })
  push_notifications: boolean;

  @Column({ name: 'job_alerts', default: true })
  job_alerts: boolean;

  @Column({ name: 'project_updates', default: true })
  project_updates: boolean;

  @Column({ name: 'blog_updates', default: false })
  blog_updates: boolean;

  @Column({ name: 'system_updates', default: true })
  system_updates: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }

  async validatePassword(password: string): Promise<boolean> {
    return this.comparePassword(password);
  }
}