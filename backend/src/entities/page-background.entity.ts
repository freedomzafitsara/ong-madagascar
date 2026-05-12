import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('page_backgrounds')
@Index(['page'])
export class PageBackground {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  page: string;

  @Column({ type: 'text' })
  image_url: string;

  @Column({ type: 'text', nullable: true })
  mobile_url: string;

  @Column({ type: 'text', nullable: true })
  thumbnail_url: string;

  @Column({ default: false })
  is_active: boolean;

  @Column({ default: 30 })
  overlay_opacity: number;

  @Column({ default: 'center' })
  position: string;

  @Column({ default: 'cover' })
  size: string;

  @Column({ nullable: true })
  alt_text: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}