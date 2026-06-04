// backend/src/entities/page-background.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne,
  JoinColumn,
  Index 
} from 'typeorm';
import { User } from './user.entity';

export type PageKey = 
  | 'home'
  | 'projects'
  | 'jobs'
  | 'blog'
  | 'contact'
  | 'login'
  | 'dashboard'
  | 'profile'
  | 'about'
  | 'faq';

@Entity('page_backgrounds')
@Index(['page_key'])
@Index(['is_active'])
export class PageBackground {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'page_key', length: 100, unique: true })
  page_key: string;

  @Column({ name: 'image_url', length: 500 })
  image_url: string;

  @Column({ name: 'mobile_url', length: 500, nullable: true })
  mobile_url: string;

  @Column({ name: 'thumbnail_url', length: 500, nullable: true })
  thumbnail_url: string;

  @Column({ name: 'alt_fr', length: 255, nullable: true })
  alt_fr: string;

  @Column({ name: 'alt_mg', length: 255, nullable: true })
  alt_mg: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'overlay_opacity', type: 'int', default: 30 })
  overlay_opacity: number;

  @Column({ length: 50, default: 'center' })
  position: string;

  @Column({ length: 50, default: 'cover' })
  size: string;

  @Column({ name: 'blur', type: 'int', default: 0 })
  blur: number;

  @Column({ name: 'brightness', type: 'int', default: 100 })
  brightness: number;

  @Column({ name: 'updated_by', nullable: true })
  updated_by: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  user: User;
}