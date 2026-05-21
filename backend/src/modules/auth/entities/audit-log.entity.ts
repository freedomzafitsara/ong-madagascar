import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  VIEW = 'VIEW',
}

export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

@Entity('audit_logs')
@Index(['userId', 'timestamp'])
@Index(['entity', 'entityId'])
@Index(['action', 'timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 20 })
  action: string;

  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ name: 'old_data', type: 'jsonb', nullable: true })
  oldData: any;

  @Column({ name: 'new_data', type: 'jsonb', nullable: true })
  newData: any;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 10, default: AuditStatus.SUCCESS })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}