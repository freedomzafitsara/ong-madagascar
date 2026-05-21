import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['entityType', 'entityId'])
export class AuditLog {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 50 })
  action: string;

  @Column({ name: 'entity_type', length: 50, nullable: true })
  entityType: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ name: 'old_data', type: 'jsonb', nullable: true })
  oldData: any;

  @Column({ name: 'new_data', type: 'jsonb', nullable: true })
  newData: any;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}