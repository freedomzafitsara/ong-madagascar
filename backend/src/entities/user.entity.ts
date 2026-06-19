// backend/src/entities/user.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
  CANDIDATE = 'candidate',
  VISITOR = 'visitor',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'first_name' })
  first_name: string;

  @Column({ name: 'last_name' })
  last_name: string;

  @Column({ name: 'phone', nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VISITOR })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'avatar_url', nullable: true })
  avatar_url: string;

  // ============================================================
  // CHAMPS DE PARAMETRES - AJOUTES
  // ============================================================

  @Column({ name: 'preferred_language', default: 'fr' })
  preferred_language: string;

  @Column({ name: 'timezone', default: 'Indian/Antananarivo' })
  timezone: string;

  @Column({ name: 'theme', default: 'light' })
  theme: string;

  @Column({ name: 'font_size', default: 'medium' })
  font_size: string;

  @Column({ name: 'sidebar_collapsed', default: false })
  sidebar_collapsed: boolean;

  @Column({ name: 'animations_enabled', default: true })
  animations_enabled: boolean;

  @Column({ name: 'density', default: 'comfortable' })
  density: string;

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

  // ============================================================
  // CHAMPS EXISTANTS
  // ============================================================

  @Column({ name: 'reset_token', nullable: true })
  reset_token: string;

  @Column({ name: 'reset_token_expires', nullable: true })
  reset_token_expires: Date;

  @Column({ name: 'last_login', nullable: true })
  last_login: Date;

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

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // ============================================================
  // METHODES D'AIDE
  // ============================================================

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
  }

  isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }

  isCandidate(): boolean {
    return this.role === UserRole.CANDIDATE;
  }

  canPostulate(): boolean {
    return this.role === UserRole.CANDIDATE || this.role === UserRole.USER;
  }

  canAccessDashboard(): boolean {
    return this.isAdmin() || this.role === UserRole.CANDIDATE;
  }
}