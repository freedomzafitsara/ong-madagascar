import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('footer_contact')
export class FooterContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column()
  value: string;

  @Column()
  icon: string;

  @Column({ name: 'order_num', default: 0 })
  orderNum: number;
}