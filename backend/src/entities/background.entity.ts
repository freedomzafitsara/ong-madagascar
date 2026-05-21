import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum BackgroundPage {
  HOME = 'home',
  PROJECTS = 'projects',
  EVENTS = 'events',
  BLOG = 'blog',
  JOBS = 'jobs',
  CONTACT = 'contact',
  ABOUT = 'about',
  DONATE = 'donate',
  JOIN = 'join',
  LOGIN = 'login',
  REGISTER = 'register',
  DASHBOARD = 'dashboard',
}

@Entity('backgrounds')
@Index(['page'])
export class Background {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  page: string;

  @Column({ name: 'image_url', length: 500 })
  image_url: string;

  @Column({ name: 'thumbnail_url', length: 500, nullable: true })
  thumbnail_url: string;

  @Column({ name: 'mobile_url', length: 500, nullable: true })
  mobile_url: string;

  @Column({ name: 'is_active', default: false })
  is_active: boolean;

  @Column({ name: 'alt_text', length: 255, nullable: true })
  alt_text: string;

  @Column({ name: 'overlay_opacity', type: 'decimal', precision: 3, scale: 2, nullable: true })
  overlay_opacity: number;

  @Column({ length: 50, nullable: true })
  position: string;

  @Column({ length: 50, nullable: true })
  size: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}