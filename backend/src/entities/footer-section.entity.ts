import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { FooterLink } from './footer-link.entity';

@Entity('footer_sections')
export class FooterSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => FooterLink, (link) => link.section)
  links: FooterLink[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}