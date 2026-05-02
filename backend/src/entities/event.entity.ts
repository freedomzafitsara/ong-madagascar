import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum EventType {
  CAMP = 'camp',
  WORKSHOP = 'workshop',
  HACKATHON = 'hackathon',
  CONFERENCE = 'conference',
  FORMATION = 'formation',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_mg: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  description_mg: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar', default: EventStatus.DRAFT })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  region: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  maxCapacity: number;

  @Column({ type: 'int', default: 0 })
  currentRegistrations: number;

  @Column({ default: true })
  isFree: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column('text', { array: true, nullable: true })
  galleryImages: string[];

  @Column({ nullable: true })
  program: string;

  @Column({ nullable: true })
  speakers: string;

  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}