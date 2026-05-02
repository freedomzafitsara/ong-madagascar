import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('footer_sections')
export class FooterSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  title_mg: string;

  @Column({ name: 'order_num', default: 0 })
  orderNum: number;
}