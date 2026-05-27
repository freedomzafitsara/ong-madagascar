// backend/src/entities/beneficiary.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index 
} from 'typeorm';

@Entity('beneficiaries')
@Index(['region', 'employment_status'])
export class Beneficiary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100 })
  first_name: string;

  @Column({ name: 'last_name', length: 100 })
  last_name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100 })
  region: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ name: 'employment_status', length: 50, nullable: true })
  employment_status: string;

  @Column({ name: 'education_level', length: 100, nullable: true })
  education_level: string;

  @Column({ name: 'before_income', type: 'decimal', precision: 15, scale: 2, nullable: true })
  before_income: number;

  @Column({ name: 'after_income', type: 'decimal', precision: 15, scale: 2, nullable: true })
  after_income: number;

  @Column({ type: 'text', array: true, default: {} })
  skills: string[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}