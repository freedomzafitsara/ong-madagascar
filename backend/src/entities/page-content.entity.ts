import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export interface HeroSection {
  title_fr?: string;
  title_mg?: string;
  subtitle_fr?: string;
  subtitle_mg?: string;
  button_text_fr?: string;
  button_text_mg?: string;
  button_link?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface CTASection {
  title_fr?: string;
  title_mg?: string;
  subtitle_fr?: string;
  subtitle_mg?: string;
  button_text_fr?: string;
  button_text_mg?: string;
  button_link?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface StatsItem {
  value: string;
  label_fr: string;
  label_mg: string;
  icon?: string;
}

export interface SectionItem {
  id?: string;
  title_fr?: string;
  title_mg?: string;
  content_fr?: string;
  content_mg?: string;
  image_url?: string;
  order?: number;
  is_active?: boolean;
}

@Entity('page_contents')
@Index(['page_key'])
@Index(['is_published'])
export class PageContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ✅ COLONNE PRINCIPALE - Clé unique de la page
  @Column({ name: 'page_key', length: 100, unique: true })
  page_key: string;

  // ✅ COLONNE ADDITIONNELLE - Pour compatibilité avec la base existante
  @Column({ name: 'page', length: 100, nullable: true })
  page: string;

  // Contenu principal
  @Column({ name: 'content_fr', type: 'text', nullable: true })
  content_fr: string;

  @Column({ name: 'content_mg', type: 'text', nullable: true })
  content_mg: string;

  // Sections de la page
  @Column({ name: 'hero', type: 'jsonb', nullable: true })
  hero: HeroSection;

  @Column({ name: 'sections', type: 'jsonb', nullable: true })
  sections: SectionItem[];

  @Column({ name: 'stats', type: 'jsonb', nullable: true })
  stats: StatsItem[];

  @Column({ name: 'cta', type: 'jsonb', nullable: true })
  cta: CTASection;

  // Optimisation SEO
  @Column({ name: 'seo_title_fr', length: 70, nullable: true })
  seo_title_fr: string;

  @Column({ name: 'seo_title_mg', length: 70, nullable: true })
  seo_title_mg: string;

  @Column({ name: 'seo_description_fr', length: 160, nullable: true })
  seo_description_fr: string;

  @Column({ name: 'seo_description_mg', length: 160, nullable: true })
  seo_description_mg: string;

  @Column({ name: 'seo_keywords', type: 'text', nullable: true })
  seo_keywords: string;

  // Champs personnalisés
  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  custom_fields: any;

  // Métadonnées
  @Column({ name: 'is_published', default: true })
  is_published: boolean;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updated_by: string;

  // Audit
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}