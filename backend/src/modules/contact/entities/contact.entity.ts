// backend/src/modules/contact/entities/contact.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Index 
} from 'typeorm';

export type MessageStatus = 'unread' | 'read' | 'archived' | 'replied';

@Entity('contact_messages')
@Index(['status'])
@Index(['created_at'])
@Index(['email'])
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', length: 255 })
  full_name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'unread' })
  status: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ip_address: string;

  @Column({ name: 'replied_at', nullable: true })
  replied_at: Date;

  @Column({ name: 'replied_by', nullable: true })
  replied_by: string;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  admin_notes: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}