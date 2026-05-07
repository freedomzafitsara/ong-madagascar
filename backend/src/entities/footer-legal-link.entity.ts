import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('footer_legal_links')
export class FooterLegalLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column({ name: 'order_num', default: 0 })
  orderNum: number;
}