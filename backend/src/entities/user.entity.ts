// backend/src/entities/user.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  VISITOR = 'visitor',
  CANDIDATE = 'candidate',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

@Entity('users')
@Index(['email'])
@Index(['role'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ name: 'first_name', length: 100 })
  first_name: string;

  @Column({ name: 'last_name', length: 100 })
  last_name: string;

  // ✅ AJOUTER LA COLONNE phone
  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ 
    type: 'enum', 
    enum: UserRole, 
    default: UserRole.VISITOR 
  })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'avatar_url', nullable: true })
  avatar_url: string;

  @Column({ name: 'last_login', nullable: true })
  last_login: Date;

  @Column({ name: 'must_change_password', default: false })
  must_change_password: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Méthodes
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
  }

  isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }

  isCandidate(): boolean {
    return this.role === UserRole.CANDIDATE;
  }

  isVisitor(): boolean {
    return this.role === UserRole.VISITOR;
  }

  getFullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}