import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { EventRegistration } from './event-registration.entity';

export enum EventType {
  CAMP = 'camp',
  WORKSHOP = 'workshop',
  HACKATHON = 'hackathon',
  CONFERENCE = 'conference',
  FORMATION = 'formation',
  OTHER = 'other'
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

@Entity('events')
@Index(['status', 'startDate'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'title_mg', length: 255, nullable: true })
  title_mg: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'description_mg', type: 'text', nullable: true })
  description_mg: string;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 50, default: EventStatus.DRAFT })
  status: string;

  @Column({ length: 255 })
  location: string;

  @Column({ length: 100, nullable: true })
  region: string;

  @Column({ name: 'startDate', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'endDate', type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ name: 'maxCapacity', default: 0 })
  maxCapacity: number;

  @Column({ name: 'currentRegistrations', default: 0 })
  currentRegistrations: number;

  @Column({ name: 'isFree', default: true })
  isFree: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'imageUrl', length: 500, nullable: true })
  imageUrl: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  image_url: string;

  @Column({ name: 'galleryImages', type: 'text', nullable: true })
  galleryImages: string;

  @Column({ name: 'gallery_images', type: 'text', nullable: true })
  gallery_images: string;

  @Column({ type: 'text', nullable: true })
  program: string;

  @Column({ type: 'text', nullable: true })
  speakers: string;

  @Column({ name: 'createdBy', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @OneToMany(() => EventRegistration, (registration) => registration.event)
  registrations: EventRegistration[];
}