// backend/src/entities/blog-post.entity.ts

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

export enum ArticleType {
  NEWS = 'news',
  SUCCESS_STORY = 'success_story',
  REPORT = 'report',
}

@Entity('blog_posts')
@Index(['status'])
@Index(['created_at'])
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ============================================================
  // TITRES ET CONTENUS (FR/MG)
  // ============================================================
  @Column({ name: 'title_fr', length: 255 })
  title_fr: string;

  @Column({ name: 'title_mg', length: 255, nullable: true })
  title_mg: string;

  @Column({ name: 'content_fr', type: 'text' })
  content_fr: string;

  @Column({ name: 'content_mg', type: 'text', nullable: true })
  content_mg: string;

  @Column({ name: 'summary_fr', type: 'text', nullable: true })
  summary_fr: string;

  @Column({ name: 'summary_mg', type: 'text', nullable: true })
  summary_mg: string;

  // ============================================================
  // MÉTADONNÉES
  // ============================================================
  @Column({ type: 'varchar', default: 'news' })
  type: string;

  @Column({ name: 'image_url', nullable: true })
  image_url: string;

  @Column({ name: 'is_published', default: false })
  is_published: boolean;

  @Column({ type: 'varchar', default: 'draft' })
  status: string;

  // ============================================================
  // AUTEUR
  // ============================================================
  @Column({ name: 'author_id' })
  author_id: string;

  // ============================================================
  // ANCIENNES COLONNES (compatibilité)
  // ============================================================
  @Column({ length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  // ============================================================
  // DATES
  // ============================================================
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'published_at', nullable: true })
  published_at: Date;

  // ============================================================
  // RELATIONS
  // ============================================================
  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  // ============================================================
  // MÉTHODES UTILITAIRES
  // ============================================================
  getTitle(): string {
    return this.title_fr || this.title || 'Sans titre';
  }

  getContent(): string {
    return this.content_fr || this.content || '';
  }

  isPublished(): boolean {
    return this.is_published === true;
  }

  publish(): void {
    this.is_published = true;
    this.status = 'published';
    this.published_at = new Date();
  }

  unpublish(): void {
    this.is_published = false;
    this.status = 'draft';
  }
}