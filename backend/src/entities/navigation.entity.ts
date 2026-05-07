import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('navigations')
export class Navigation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  name_mg: string;

  @Column({ type: 'varchar', length: 255 })
  href: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'varchar', length: 50, default: 'desktop' })
  location: string; // 'desktop', 'mobile', 'both'

  @Column({ type: 'boolean', default: false })
  has_badge: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  badge_text: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}