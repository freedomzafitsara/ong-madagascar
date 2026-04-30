import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FooterSection } from './footer-section.entity';

@Entity('footer_links')
export class FooterLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FooterSection, (section) => section.links)
  @JoinColumn({ name: 'section_id' })
  section: FooterSection;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}