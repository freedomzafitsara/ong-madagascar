// backend/src/entities/user.entity.ts
import { 
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, 
  UpdateDateColumn, BeforeInsert, Index 
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STAFF = 'staff',
  MEMBER = 'member',
  VOLUNTEER = 'volunteer',
  PARTNER = 'partner',
  VISITOR = 'visitor',
}

@Entity('users')
@Index(['email'])
@Index(['role'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ✅ Correction: utiliser name: 'avatar_url' pour correspondre à la base
  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatar_url: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  position: string;

  @Column({ nullable: true, type: 'varchar', length: 100 })
  department: string;

  @Column({ nullable: true, type: 'text' })
  skills: string;

  @Column({ name: 'social_linkedin', nullable: true, type: 'text' })
  socialLinkedin: string;

  @Column({ name: 'social_twitter', nullable: true, type: 'text' })
  socialTwitter: string;

  @Column({ name: 'social_github', nullable: true, type: 'text' })
  socialGithub: string;

  @Column({ type: 'varchar', default: UserRole.VISITOR })
  role: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @Column({ name: 'last_ip', nullable: true })
  lastIp: string;

  @Column({ name: 'login_attempts', default: 0 })
  loginAttempts: number;

  @Column({ name: 'locked_until', nullable: true })
  lockedUntil: Date;

  @Column({ name: 'reset_password_token', nullable: true })
  resetPasswordToken: string;

  @Column({ name: 'reset_password_expires', nullable: true })
  resetPasswordExpires: Date;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'verification_token', nullable: true })
  verificationToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      const saltRounds = this.role === UserRole.SUPER_ADMIN ? 12 : 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
      console.log('Hash généré pour:', this.email);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }

  isLocked(): boolean {
    return this.lockedUntil && this.lockedUntil > new Date();
  }

  incrementLoginAttempts(): void {
    this.loginAttempts += 1;
    const maxAttempts = this.role === UserRole.SUPER_ADMIN ? 3 : 5;
    const lockDuration = this.role === UserRole.SUPER_ADMIN ? 60 : 30;
    
    if (this.loginAttempts >= maxAttempts) {
      this.lockedUntil = new Date(Date.now() + lockDuration * 60 * 1000);
    }
  }

  resetLoginAttempts(): void {
    this.loginAttempts = 0;
    this.lockedUntil = null;
  }
}