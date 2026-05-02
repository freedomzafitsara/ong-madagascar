import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('footer_links')
export class FooterLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_mg: string;

  @Column()
  url: string;

  @Column({ name: 'order_num', default: 0 })
  orderNum: number;

  @Column({ name: 'section_id' })
  sectionId: string;
}