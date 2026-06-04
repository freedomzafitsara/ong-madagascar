import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index 
} from 'typeorm';

/**
 * Entité pour les fichiers uploadés (Cloudinary)
 * @description Stocke les métadonnées des fichiers uploadés sur Cloudinary
 */
@Entity('uploaded_files')
@Index(['type', 'entityId'])
@Index(['publicId'])
@Index(['createdAt'])
export class UploadedFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ============================================================
  // INFORMATIONS DU FICHIER
  // ============================================================

  @Column({ type: 'varchar', length: 500, name: 'url' })
  url: string;

  @Column({ type: 'varchar', length: 255, name: 'public_id' })
  publicId: string;

  @Column({ type: 'varchar', length: 255, name: 'filename' })
  filename: string;

  @Column({ type: 'varchar', length: 255, name: 'original_name' })
  originalName: string;

  @Column({ type: 'varchar', length: 50, name: 'format', nullable: true })
  format: string;

  @Column({ type: 'int', name: 'size', nullable: true })
  size: number;

  @Column({ type: 'int', name: 'width', nullable: true })
  width: number;

  @Column({ type: 'int', name: 'height', nullable: true })
  height: number;

  // ============================================================
  // MÉTADONNÉES
  // ============================================================

  @Column({ type: 'varchar', length: 50, name: 'type' })
  type: string;

  @Column({ type: 'varchar', length: 255, name: 'entity_id', nullable: true })
  entityId: string;

  // ============================================================
  // DATES
  // ============================================================

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ============================================================
  // MÉTHODES UTILITAIRES
  // ============================================================

  /**
   * Vérifie si le fichier est une image
   */
  isImage(): boolean {
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    return this.format ? imageFormats.includes(this.format.toLowerCase()) : false;
  }

  /**
   * Vérifie si le fichier est un document (PDF, DOC, etc.)
   */
  isDocument(): boolean {
    const documentFormats = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    return this.format ? documentFormats.includes(this.format.toLowerCase()) : false;
  }

  /**
   * Retourne la taille du fichier formatée
   */
  getFormattedSize(): string {
    if (!this.size) return '0 Ko';
    
    const sizes = ['octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(this.size) / Math.log(1024));
    return `${(this.size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Retourne l'URL optimisée avec transformations Cloudinary
   * @param width - Largeur souhaitée
   * @param height - Hauteur souhaitée
   * @param quality - Qualité (1-100)
   */
  getOptimizedUrl(width?: number, height?: number, quality?: number): string {
    let url = this.url;
    const transformations: string[] = [];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    
    if (transformations.length > 0) {
      // Insertion des transformations dans l'URL Cloudinary
      url = url.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }
    
    return url;
  }

  /**
   * Retourne l'URL pour le thumbnail
   */
  getThumbnailUrl(): string {
    return this.getOptimizedUrl(150, 150, 80);
  }

  /**
   * Retourne l'URL pour le format medium
   */
  getMediumUrl(): string {
    return this.getOptimizedUrl(500, undefined, 90);
  }

  /**
   * Retourne l'URL pour le format large
   */
  getLargeUrl(): string {
    return this.getOptimizedUrl(1200, undefined, 100);
  }
}