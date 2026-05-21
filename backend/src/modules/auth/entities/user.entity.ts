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
  STAFF = 'staff',
  MEMBER = 'member',
  VOLUNTEER = 'volunteer',
  PARTNER = 'partner',
  VISITOR = 'visitor',
}

@Entity('users')
@Index(['email'])
@Index(['role'])
@Index(['isActive'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ select: false, length: 255 })
  password: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ 
    type: 'varchar', 
    length: 20,
    default: UserRole.VISITOR 
  })
  role: string;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'region', length: 100, nullable: true })
  region: string;

  @Column({ name: 'position', length: 100, nullable: true })
  position: string;

  @Column({ name: 'department', length: 100, nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  skills: string;

  @Column({ name: 'social_linkedin', length: 255, nullable: true })
  socialLinkedin: string;

  @Column({ name: 'social_twitter', length: 255, nullable: true })
  socialTwitter: string;

  @Column({ name: 'social_github', length: 255, nullable: true })
  socialGithub: string;

  @Column({ name: 'reset_password_token', nullable: true })
  resetPasswordToken: string;

  @Column({ name: 'reset_password_expires', nullable: true })
  resetPasswordExpires: Date;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'verification_token', nullable: true })
  verificationToken: string;

  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @Column({ name: 'last_ip', length: 45, nullable: true })
  lastIp: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }
}