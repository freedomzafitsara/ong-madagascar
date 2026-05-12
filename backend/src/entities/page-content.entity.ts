import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PageType {
  HOME = 'home',
  ABOUT = 'about',
  PROJECTS = 'projects',
  JOBS = 'jobs',
  EVENTS = 'events',
  BLOG = 'blog',
  CONTACT = 'contact',
  DONATE = 'donate',
  JOIN = 'join',
  VOLUNTEERS = 'volunteers',
  PARTNERS = 'partners',
}

// Interface pour Hero Section
export interface HeroSection {
  title: string;
  title_mg: string;
  subtitle: string;
  subtitle_mg: string;
  badge: string;
  badge_mg: string;
  buttonText: string;
  buttonText_mg: string;
  buttonLink: string;
  imageUrl: string;
  videoUrl: string;
}

// Interface pour une Section
export interface PageSection {
  id: string;
  title: string;
  title_mg: string;
  description: string;
  description_mg: string;
  imageUrl: string;
  icon: string;
  order: number;
  isActive: boolean;
}

// Interface pour les Statistiques
export interface PageStat {
  value: string;
  label: string;
  label_mg: string;
  icon: string;
}

// Interface pour CTA
export interface CtaSection {
  title: string;
  title_mg: string;
  description: string;
  description_mg: string;
  buttonText: string;
  buttonText_mg: string;
  buttonLink: string;
  imageUrl: string;
}

@Entity('page_contents')
@Index(['page'])
export class PageContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  page: string;

  @Column({ type: 'jsonb', nullable: true })
  hero: HeroSection;

  @Column({ type: 'jsonb', nullable: true })
  sections: PageSection[];

  @Column({ type: 'jsonb', nullable: true })
  stats: PageStat[];

  @Column({ type: 'jsonb', nullable: true })
  cta: CtaSection;

  @Column({ type: 'text', nullable: true })
  seo_title: string;

  @Column({ type: 'text', nullable: true })
  seo_description: string;

  @Column({ type: 'text', nullable: true })
  seo_keywords: string;

  @Column({ default: true })
  is_published: boolean;

  @Column({ type: 'jsonb', nullable: true })
  custom_fields: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}