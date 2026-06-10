// backend/src/modules/contact/entities/contact.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Index 
} from 'typeorm';

@Entity('contact_messages')
@Index(['status'])
@Index(['created_at'])
@Index(['email'])
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', length: 255 })  // Changé: full_name -> name
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 500 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'unread' })
  status: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ip_address: string;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  admin_notes: string;

  @Column({ name: 'replied_at', nullable: true })
  replied_at: Date;

  @Column({ name: 'replied_by_id', nullable: true })  // Changé: replied_by -> replied_by_id
  replied_by_id: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}