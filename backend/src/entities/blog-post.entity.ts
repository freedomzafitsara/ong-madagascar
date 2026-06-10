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

@Entity('blog_posts')
@Index(['status'])
@Index(['created_at'])
@Index(['slug'])
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ name: 'image_url', nullable: true })
  image_url: string;

  @Column({ unique: true, nullable: true })
  slug: string;

  @Column({ default: 'draft' })
  status: string;

  @Column({ type: 'varchar', length: 50, nullable: true, default: 'news' })
  type: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ name: 'author', nullable: true })
  author: string;

  @Column({ name: 'author_id' })
  author_id: string;

  @Column({ name: 'category_id', nullable: true })
  category_id: string;

  @Column({ name: 'views', type: 'int', default: 0 })
  views: number;

  @Column({ name: 'published_at', nullable: true })
  published_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  authorUser: User;

  @ManyToOne('Category', { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: any;
}