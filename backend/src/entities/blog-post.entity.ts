import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PostType {
  ACTUALITE = 'actualite',
  TEMOIGNAGE = 'temoignage',
  RAPPORT = 'rapport',
  EVENT = 'event',
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  title_mg: string;

  @Column('text')
  content: string;

  @Column('text')
  content_mg: string;

  @Column('text')
  summary: string;

  @Column('text')
  summary_mg: string;

  @Column()
  author: string;

  @Column({ name: 'author_id', nullable: true })
  authorId: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column()
  type: string;

  @Column({ default: PostStatus.DRAFT })
  status: string;

  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Column({ default: 0 })
  views: number;

  @Column({ name: 'published_at', nullable: true })
  publishedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}