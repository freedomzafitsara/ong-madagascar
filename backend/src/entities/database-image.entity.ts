// backend/src/entities/database-image.entity.ts
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index 
} from 'typeorm';

/**
 * Entité pour le stockage des images et documents en base de données
 * 
 * Cette entité permet de stocker les fichiers (images, PDF) directement
 * dans la base de données PostgreSQL via le type bytea.
 * 
 * @Entity database_images
 */
@Entity('database_images')
@Index(['entityType', 'entityId'])
export class DatabaseImage {
  /**
   * Identifiant unique UUID v4
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Type d'entité associée (job, project, blog, profile, background, cv, cover_letter)
   */
  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  /**
   * Identifiant UUID de l'entité associée
   */
  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string;

  /**
   * Nom du fichier stocké
   */
  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  /**
   * Nom original du fichier
   */
  @Column({ name: 'original_name', length: 255 })
  originalName: string;

  /**
   * Type MIME du fichier (image/jpeg, image/png, application/pdf, etc.)
   */
  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  /**
   * Taille du fichier en bytes
   */
  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  /**
   * Données binaires du fichier stockées en base
   */
  @Column({ name: 'image_data', type: 'bytea' })
  imageData: Buffer;

  /**
   * Indique si l'image est l'image principale d'une entité
   */
  @Column({ name: 'is_main', default: false })
  isMain: boolean;

  /**
   * Ordre d'affichage pour la galerie
   */
  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  /**
   * Texte alternatif en français pour l'accessibilité
   */
  @Column({ name: 'alt_text_fr', type: 'text', nullable: true })
  altTextFr: string;

  /**
   * Texte alternatif en malgache pour l'accessibilité
   */
  @Column({ name: 'alt_text_mg', type: 'text', nullable: true })
  altTextMg: string;

  /**
   * Date de création
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Date de dernière modification
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}