// src/modules/members/entities/member.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ unique: true })
  memberNumber: string;

  @Column({ default: 'standard' })
  membershipType: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ nullable: true })
  cardUrl: string;

  @Column({ nullable: true })
  qrCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}