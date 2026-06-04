// backend/src/entities/page-content.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PageType {
  HOME = 'home',
  PROJECTS = 'projects',
  JOBS = 'jobs',
  CONTACT = 'contact',
  LOGIN = 'login',
}

export interface HeroSection {
  title_fr: string;
  title_mg: string;
  subtitle_fr: string;
  subtitle_mg: string;
  button_text_fr: string;
  button_text_mg: string;
  button_link: string;
  image_url: string;
  is_active?: boolean;  // ✅ Corrigé: is_active au lieu de s_active
}

export interface PageSection {
  id: string;
  title_fr: string;
  title_mg: string;
  description_fr: string;
  description_mg: string;
  image_url: string;
  order: number;
  is_active: boolean;
}

export interface PageStat {
  value: string;
  label_fr: string;
  label_mg: string;
  icon: string;
}

export interface CtaSection {
  title_fr: string;
  title_mg: string;
  description_fr: string;
  description_mg: string;
  button_text_fr: string;
  button_text_mg: string;
  button_link: string;
  is_active?: boolean;
}

@Entity('page_contents')
@Index(['page_key'])
@Index(['is_published'])
export class PageContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'page_key', length: 100, unique: true })
  page_key: string;

  @Column({ name: 'content_fr', type: 'text', nullable: true })
  content_fr: string;

  @Column({ name: 'content_mg', type: 'text', nullable: true })
  content_mg: string;

  @Column({ type: 'jsonb', nullable: true })
  hero: HeroSection;

  @Column({ type: 'jsonb', nullable: true })
  sections: PageSection[];

  @Column({ type: 'jsonb', nullable: true })
  stats: PageStat[];

  @Column({ type: 'jsonb', nullable: true })
  cta: CtaSection;

  @Column({ name: 'seo_title_fr', length: 70, nullable: true })
  seo_title_fr: string;

  @Column({ name: 'seo_title_mg', length: 70, nullable: true })
  seo_title_mg: string;

  @Column({ name: 'seo_description_fr', length: 160, nullable: true })
  seo_description_fr: string;

  @Column({ name: 'seo_description_mg', length: 160, nullable: true })
  seo_description_mg: string;

  @Column({ name: 'seo_keywords', nullable: true })
  seo_keywords: string;

  @Column({ name: 'is_published', default: true })
  is_published: boolean;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  custom_fields: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}