import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
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
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  region: string;

  @Column({ type: 'varchar', default: UserRole.VISITOR })
  role: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  // 🔐 NOUVEAUX CHAMPS POUR MOT DE PASSE OUBLIÉ
  @Column({ name: 'reset_password_token', nullable: true })
  resetPasswordToken: string;

  @Column({ name: 'reset_password_expires', nullable: true })
  resetPasswordExpires: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      console.log('🔐 HASH - Mot de passe original:', this.password);
      this.password = await bcrypt.hash(this.password, 10);
      console.log('🔐 HASH - Hash généré:', this.password);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    console.log('═══════════════════════════════════════════════');
    console.log('🔐 COMPARE - Vérification du mot de passe');
    console.log('🔐 COMPARE - Mot de passe saisi par l\'utilisateur:', attempt);
    console.log('🔐 COMPARE - Hash stocké dans la base de données:', this.password);
    console.log('🔐 COMPARE - Longueur du hash:', this.password?.length);
    console.log('🔐 COMPARE - Début du hash:', this.password?.substring(0, 20));
    
    const result = await bcrypt.compare(attempt, this.password);
    
    console.log('🔐 COMPARE - Résultat de bcrypt.compare():', result);
    console.log('═══════════════════════════════════════════════');
    
    return result;
  }
}