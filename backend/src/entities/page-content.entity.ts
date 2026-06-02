// backend/src/entities/page-content.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

// Types de pages supportés par votre thème
export enum PageType {
  HOME = 'home',
  PROJECTS = 'projects',
  JOBS = 'jobs',
  CONTACT = 'contact',
  LOGIN = 'login',
}

// Interface pour Hero Section (bannière principale)
export interface HeroSection {
  title_fr: string;
  title_mg: string;
  subtitle_fr: string;
  subtitle_mg: string;
  button_text_fr: string;
  button_text_mg: string;
  button_link: string;
  image_url: string;
}

// Interface pour une Section générique
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

// Interface pour les Statistiques (ex: sur la page d'accueil)
export interface PageStat {
  value: string;
  label_fr: string;
  label_mg: string;
  icon: string;
}

// Interface pour CTA (Call To Action)
export interface CtaSection {
  title_fr: string;
  title_mg: string;
  description_fr: string;
  description_mg: string;
  button_text_fr: string;
  button_text_mg: string;
  button_link: string;
}

@Entity('page_contents')
@Index(['page'])
@Index(['is_published'])
export class PageContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nom de la page (home, projects, jobs, contact, login)
  @Column({ unique: true })
  page: string;

  // Section Hero (bannière principale)
  @Column({ type: 'jsonb', nullable: true })
  hero: HeroSection;

  // Sections dynamiques (liste de blocs)
  @Column({ type: 'jsonb', nullable: true })
  sections: PageSection[];

  // Statistiques (chiffres clés)
  @Column({ type: 'jsonb', nullable: true })
  stats: PageStat[];

  // Call To Action (bannière d'appel à l'action)
  @Column({ type: 'jsonb', nullable: true })
  cta: CtaSection;

  // SEO (optimisation moteurs de recherche)
  @Column({ type: 'text', nullable: true })
  seo_title_fr: string;

  @Column({ type: 'text', nullable: true })
  seo_title_mg: string;

  @Column({ type: 'text', nullable: true })
  seo_description_fr: string;

  @Column({ type: 'text', nullable: true })
  seo_description_mg: string;

  @Column({ type: 'text', nullable: true })
  seo_keywords: string;

  // Statut de publication
  @Column({ default: true })
  is_published: boolean;

  // Champs personnalisés (pour flexibilité future)
  @Column({ type: 'jsonb', nullable: true })
  custom_fields: Record<string, any>;

  // Dates
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}