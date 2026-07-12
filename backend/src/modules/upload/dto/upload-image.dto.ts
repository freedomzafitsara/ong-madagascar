// backend/src/modules/upload/dto/upload-image.dto.ts

import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, IsUUID, IsIn, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

// ============================================================
// TYPES D'ENTITÉS AUTORISÉS
// ============================================================

export const ENTITY_TYPES = [
  'job', 
  'project', 
  'blog', 
  'profile', 
  'banner', 
  'logo', 
  'background', 
  'cv', 
  'diploma', 
  'attestation'
] as const;

export type EntityType = typeof ENTITY_TYPES[number];

// ============================================================
// DTO POUR L'UPLOAD D'UNE IMAGE
// ============================================================

export class UploadImageDto {
  /**
   * Type d'entité associée à l'image
   * Valeurs autorisées: job, project, blog, profile, banner, logo, background, cv, diploma, attestation
   */
  @IsOptional()
  @IsString({ message: 'Le type d\'entite doit etre une chaine de caracteres' })
  @IsIn(ENTITY_TYPES, { 
    message: 'Le type doit etre: job, project, blog, profile, banner, logo, background, cv, diploma ou attestation' 
  })
  entityType?: EntityType;

  /**
   * ✅ AJOUT: Champ de compatibilité pour le frontend
   * Identique à entityType
   */
  @IsOptional()
  @IsString({ message: 'type doit etre une chaine de caracteres' })
  @IsIn(ENTITY_TYPES, { 
    message: 'Le type doit etre: job, project, blog, profile, banner, logo, background, cv, diploma ou attestation' 
  })
  type?: string;

  /**
   * ID de l'entité associée (optionnel)
   * Utilisé pour lier l'image à une entité existante
   */
  @IsOptional()
  @IsUUID(4, { message: 'L\'ID de l\'entite doit etre un UUID valide' })
  entityId?: string;

  /**
   * ✅ AJOUT: Champ de compatibilité pour le frontend
   * Identique à entityId
   */
  @IsOptional()
  @IsUUID(4, { message: 'entity_id doit etre un UUID valide' })
  entity_id?: string;

  /**
   * Indique si l'image est l'image principale
   */
  @IsOptional()
  @IsBoolean({ message: 'isMain doit etre un booleen' })
  @Transform(({ value }) => value === 'true' || value === true)
  isMain?: boolean;

  /**
   * Ordre d'affichage de l'image
   */
  @IsOptional()
  @IsInt({ message: 'displayOrder doit etre un nombre entier' })
  @Min(0, { message: 'displayOrder doit etre superieur ou egal a 0' })
  @Max(100, { message: 'displayOrder ne doit pas depasser 100' })
  @Transform(({ value }) => parseInt(value, 10))
  displayOrder?: number;

  /**
   * Texte alternatif en français
   */
  @IsOptional()
  @IsString({ message: 'altTextFr doit etre une chaine de caracteres' })
  altTextFr?: string;

  /**
   * Texte alternatif en malgache
   */
  @IsOptional()
  @IsString({ message: 'altTextMg doit etre une chaine de caracteres' })
  altTextMg?: string;

  /**
   * Nom original du fichier (transmis par le frontend)
   */
  @IsOptional()
  @IsString({ message: 'originalName doit etre une chaine de caracteres' })
  originalName?: string;

  /**
   * Taille du fichier (transmis par le frontend)
   */
  @IsOptional()
  @IsInt({ message: 'fileSize doit etre un nombre entier' })
  @Min(0, { message: 'fileSize doit etre superieur ou egal a 0' })
  @Transform(({ value }) => parseInt(value, 10))
  fileSize?: number;

  /**
   * Format du fichier (transmis par le frontend)
   */
  @IsOptional()
  @IsString({ message: 'format doit etre une chaine de caracteres' })
  format?: string;
}

// ============================================================
// DTO POUR LA MISE À JOUR DU TEXTE ALTERNATIF
// ============================================================

export class UpdateImageAltDto {
  @IsOptional()
  @IsString({ message: 'altTextFr doit etre une chaine de caracteres' })
  altTextFr?: string;

  @IsOptional()
  @IsString({ message: 'altTextMg doit etre une chaine de caracteres' })
  altTextMg?: string;
}

// ============================================================
// DTO POUR LE RÉORDONNANCEMENT DES IMAGES
// ============================================================

export class ReorderImagesDto {
  @IsString({ each: true, message: 'Chaque ID d\'image doit etre une chaine de caracteres' })
  imageIds: string[];
}

// ============================================================
// DTO DE RÉPONSE POUR UNE IMAGE
// ============================================================

export class ImageResponseDto {
  id: string;
  url: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  isMain: boolean;
  displayOrder: number;
  altTextFr?: string;
  altTextMg?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ImageResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(entity: any): ImageResponseDto {
    return new ImageResponseDto({
      id: entity.id,
      url: entity.url || `/uploads/${entity.filename}`,
      fileName: entity.filename,
      originalName: entity.originalName,
      fileSize: entity.size,
      mimeType: entity.mimeType,
      isMain: entity.isMain || false,
      displayOrder: entity.displayOrder || 0,
      altTextFr: entity.altTextFr,
      altTextMg: entity.altTextMg,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

// ============================================================
// DTO DE RÉPONSE POUR L'UPLOAD
// ============================================================

export class UploadResponseDto {
  success: boolean;
  id: string;
  url: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  isMain: boolean;
  displayOrder: number;
  createdAt: Date;

  constructor(partial: Partial<UploadResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(entity: any): UploadResponseDto {
    return new UploadResponseDto({
      success: true,
      id: entity.id,
      url: entity.url || `/uploads/${entity.filename}`,
      fileName: entity.filename,
      originalName: entity.originalName,
      fileSize: entity.size,
      mimeType: entity.mimeType,
      isMain: entity.isMain || false,
      displayOrder: entity.displayOrder || 0,
      createdAt: entity.createdAt,
    });
  }
}

// ============================================================
// DTO DE RÉPONSE POUR LA LISTE DES IMAGES
// ============================================================

export class ImagesListResponseDto {
  success: boolean;
  images: ImageResponseDto[];
  total: number;

  constructor(images: ImageResponseDto[], total: number) {
    this.success = true;
    this.images = images;
    this.total = total;
  }
}

// ============================================================
// DTO DE RÉPONSE POUR LA SUPPRESSION
// ============================================================

export class DeleteResponseDto {
  success: boolean;
  message: string;

  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }
}

// ============================================================
// DTO POUR LES REQUÊTES DE LISTE
// ============================================================

export class ListImagesQueryDto {
  @IsOptional()
  @IsString({ message: 'entityType doit etre une chaine de caracteres' })
  @IsIn(ENTITY_TYPES, { 
    message: 'Le type doit etre: job, project, blog, profile, banner, logo, background, cv, diploma ou attestation' 
  })
  entityType?: string;

  @IsOptional()
  @IsUUID(4, { message: 'entityId doit etre un UUID valide' })
  entityId?: string;

  @IsOptional()
  @IsInt({ message: 'limit doit etre un nombre entier' })
  @Min(1, { message: 'limit doit etre superieur ou egal a 1' })
  @Max(100, { message: 'limit ne doit pas depasser 100' })
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 50;

  @IsOptional()
  @IsInt({ message: 'page doit etre un nombre entier' })
  @Min(1, { message: 'page doit etre superieur ou egal a 1' })
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;
}

// ============================================================
// DTO POUR LA MISE À JOUR DES MÉTADONNÉES
// ============================================================

export class UpdateImageMetadataDto {
  @IsOptional()
  @IsString({ message: 'altTextFr doit etre une chaine de caracteres' })
  altTextFr?: string;

  @IsOptional()
  @IsString({ message: 'altTextMg doit etre une chaine de caracteres' })
  altTextMg?: string;

  @IsOptional()
  @IsBoolean({ message: 'isMain doit etre un booleen' })
  @Transform(({ value }) => value === 'true' || value === true)
  isMain?: boolean;

  @IsOptional()
  @IsInt({ message: 'displayOrder doit etre un nombre entier' })
  @Min(0, { message: 'displayOrder doit etre superieur ou egal a 0' })
  @Max(100, { message: 'displayOrder ne doit pas depasser 100' })
  @Transform(({ value }) => parseInt(value, 10))
  displayOrder?: number;
}