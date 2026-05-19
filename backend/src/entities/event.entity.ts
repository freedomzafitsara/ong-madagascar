// backend/src/entities/event.entity.ts
// VERSION CORRESPONDANT EXACTEMENT À VOTRE BASE DE DONNÉES

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum EventType {
  CAMP = 'camp',
  WORKSHOP = 'workshop',
  HACKATHON = 'hackathon',
  CONFERENCE = 'conference',
  FORMATION = 'formation'
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, nullable: true })
  title_mg: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  description_mg: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 50, default: 'published' })
  status: string;

  // ⚠️ CORRECTION IMPORTANTE : La colonne 'address' n'existe PAS dans votre BDD
  // Utilisez 'location' à la place (cette colonne existe dans votre table events)
  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ length: 100, nullable: true })
  region: string;

  @Column({ name: 'startDate', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'endDate', type: 'timestamp' })
  endDate: Date;

  @Column({ name: 'maxCapacity', type: 'int', nullable: true })
  maxCapacity: number;

  @Column({ name: 'currentRegistrations', type: 'int', default: 0 })
  currentRegistrations: number;

  @Column({ name: 'isFree', type: 'boolean', default: true })
  isFree: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'imageUrl', length: 255, nullable: true })
  imageUrl: string;

  @Column({ type: 'text', array: true, nullable: true })
  galleryImages: string[];

  @Column({ type: 'text', nullable: true })
  program: string;

  @Column({ type: 'text', nullable: true })
  speakers: string;

  @Column({ name: 'createdBy', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'createdAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updatedAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Champs supplémentaires de votre BDD
  @Column({ type: 'text', nullable: true })
  image_url: string;

  @Column({ type: 'text', nullable: true })
  gallery_images: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'now()' })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;
}