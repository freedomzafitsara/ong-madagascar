// backend/src/modules/language/entities/translation.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('translations')
@Index(['key'])
export class Translation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  key: string;

  @Column({ name: 'value_fr', type: 'text' })
  value_fr: string;

  @Column({ name: 'value_mg', type: 'text' })
  value_mg: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}