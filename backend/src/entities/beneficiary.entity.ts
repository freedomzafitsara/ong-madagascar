// backend/src/entities/beneficiary.entity.ts

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne, 
  ManyToMany, 
  JoinTable 
} from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';

// ============================================
// ENUMS (optionnels mais utiles)
// ============================================
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum EducationLevel {
  PRIMARY = 'primaire',
  MIDDLE = 'ceg',
  HIGH = 'lycee',
  UNIVERSITY = 'universite',
  NONE = 'aucun',
}

export enum EmploymentStatus {
  UNEMPLOYED = 'chomeur',
  STUDENT = 'etudiant',
  EMPLOYED = 'employe',
  ENTREPRENEUR = 'entrepreneur',
}

// ============================================
// ENTITÉ PRINCIPALE
// ============================================
@Entity('beneficiaries')
export class Beneficiary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ----- INFOS PERSONNELLES -----
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string;

  // ----- CONTACT -----
  @Column({ nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  // ----- LOCALISATION (Madagascar) -----
  @Column({ length: 100, nullable: true })
  region: string;

  @Column({ length: 100, nullable: true })
  commune: string;

  @Column({ length: 100, nullable: true })
  fokontany: string;

  // ----- SITUATION PROFESSIONNELLE -----
  @Column({ name: 'education_level', length: 100, nullable: true })
  educationLevel: string;

  @Column({ name: 'employment_status', length: 50, nullable: true })
  employmentStatus: string;

  // ⭐ MESURE D'IMPACT (champs les plus importants)
  @Column({ name: 'before_ymad', type: 'text', nullable: true })
  beforeYmAd: string;

  @Column({ name: 'after_ymad', type: 'text', nullable: true })
  afterYmAd: string;

  // ----- RELATIONS -----
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user: User;

  // Relation MANY-TO-MANY avec Projects
  @ManyToMany(() => Project, (project) => project.beneficiaries)
  @JoinTable({
    name: 'project_beneficiaries',
    joinColumn: { name: 'beneficiary_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'project_id', referencedColumnName: 'id' },
  })
  projects: Project[];

  // ----- DATES -----
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

