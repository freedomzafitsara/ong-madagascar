import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index 
} from 'typeorm';

export type PartnerType = 'company' | 'ngo' | 'embassy' | 'institution';

@Entity('partners')
@Index(['partner_type', 'is_featured'])
export class Partner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'name_mg', length: 255, nullable: true })
  name_mg: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logo_url: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'description_mg', type: 'text', nullable: true })
  description_mg: string;

  @Column({ 
    name: 'partner_type',
    type: 'varchar',
    length: 50,
    default: 'company'
  })
  partner_type: PartnerType;

  @Column({ name: 'is_featured', default: false })
  is_featured: boolean;

  @Column({ name: 'contract_url', type: 'text', nullable: true })
  contract_url: string;

  @Column({ name: 'contribution_amount', type: 'decimal', precision: 15, scale: 2, nullable: true })
  contribution_amount: number;

  @Column({ name: 'contact_email', length: 255, nullable: true })
  contact_email: string;

  @Column({ name: 'contact_phone', length: 50, nullable: true })
  contact_phone: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}