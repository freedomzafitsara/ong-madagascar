// backend/src/entities/page-background.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

@Entity('page_backgrounds')
@Index(['page_key'])
@Index(['is_active'])
export class PageBackground {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'page_key', length: 100, unique: true })
  page_key: string;

  @Column({ name: 'image_url', type: 'text' })
  image_url: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'overlay_opacity', default: 40 })
  overlay_opacity: number;

  @Column({ name: 'position', length: 50, default: 'center' })
  position: string;

  @Column({ name: 'size', length: 50, default: 'cover' })
  size: string;

  @Column({ name: 'alt_fr', type: 'text', nullable: true })
  alt_fr: string;

  @Column({ name: 'alt_mg', type: 'text', nullable: true })
  alt_mg: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updated_by: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}