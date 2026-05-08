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

  @Column({ unique: true })
  page: string;

  @Column()
  image_url: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ nullable: true })
  mobile_url: string;

  @Column({ default: false })
  is_active: boolean;

  @Column({ nullable: true })
  alt_text: string;

  @Column({ nullable: true })
  overlay_opacity: number;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  size: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}