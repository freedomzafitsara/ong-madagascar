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

export type ArticleType = 'news' | 'testimonial' | 'report' | 'success_story' | 'event_recap';
export type PostStatus = 'draft' | 'published' | 'archived';

@Entity('blog_posts')
@Index(['status', 'published_at'])
@Index(['slug'])
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'title_mg', length: 255, nullable: true })
  title_mg: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', name: 'summary' })
  summary: string;

  @Column({ name: 'summary_mg', type: 'text', nullable: true })
  summary_mg: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'content_mg', type: 'text', nullable: true })
  content_mg: string;

  @Column({ 
    name: 'type',
    length: 50,
    default: 'news'
  })
  type: ArticleType;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  image_url: string;

  @Column({ 
    length: 20,
    default: 'draft'
  })
  status: PostStatus;

  @Column({ length: 255, nullable: true })
  author: string;

  @Column({ name: 'author_id', nullable: true })
  author_id: string;

  @Column({ type: 'text', array: true, default: {} })
  tags: string[];

  @Column({ default: 0 })
  views: number;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  published_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  user: User;
}