// backend/src/entities/category.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  OneToMany 
} from 'typeorm';
import { BlogPost } from './blog-post.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name_fr', length: 100, unique: true })
  name_fr: string;

  @Column({ name: 'name_mg', length: 100, nullable: true })
  name_mg: string;

  @Column({ unique: true })
  slug: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @OneToMany(() => BlogPost, (post) => post.category)
  posts: BlogPost[];
}