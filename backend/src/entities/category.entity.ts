// backend/src/entities/category.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  OneToMany 
} from 'typeorm';

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

  // Utiliser une fonction fléchée pour éviter l'import circulaire
  @OneToMany('BlogPost', (post: any) => post.category)
  posts: any[];
}