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
    default: UserRole.ADMIN 
  })
  role: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

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
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }
}