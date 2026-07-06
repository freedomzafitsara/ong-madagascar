// backend/src/modules/contact/entities/contact.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('contacts')
@Index(['email', 'created_at'])
@Index(['status'])
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ['unread', 'read', 'replied', 'archived'],
    default: 'unread',
  })
  status: 'unread' | 'read' | 'replied' | 'archived';

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  admin_notes: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ip_address: string;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  read_at: Date;

  @Column({ name: 'replied_at', type: 'timestamp', nullable: true })
  replied_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}