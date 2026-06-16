// backend/src/entities/page-content.entity.ts

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

  @Column({ name: 'hero', type: 'jsonb', nullable: true })
  hero: HeroSection;

  @Column({ name: 'sections', type: 'jsonb', nullable: true })
  sections: any;

  @Column({ name: 'stats', type: 'jsonb', nullable: true })
  stats: any;

  @Column({ name: 'cta', type: 'jsonb', nullable: true })
  cta: any;

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

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  custom_fields: any;

  @Column({ name: 'is_published', default: true })
  is_published: boolean;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updated_by: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}