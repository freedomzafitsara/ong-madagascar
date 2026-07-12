// backend/src/entities/uploaded-file.entity.ts

import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index 
} from 'typeorm';

@Entity('uploaded_files')
@Index(['type', 'entityId'])
@Index(['createdAt'])
export class UploadedFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500, name: 'url' })
  url: string;

  @Column({ type: 'varchar', length: 255, name: 'file_path' })
  filePath: string;

  @Column({ type: 'varchar', length: 255, name: 'filename' })
  filename: string;

  @Column({ type: 'varchar', length: 255, name: 'original_name' })
  originalName: string;

  @Column({ type: 'varchar', length: 50, name: 'format', nullable: true })
  format: string;

  @Column({ type: 'int', name: 'size', nullable: true })
  size: number;

  @Column({ type: 'varchar', length: 50, name: 'type' })
  type: string;

  @Column({ type: 'varchar', length: 255, name: 'entity_id', nullable: true })
  entityId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}