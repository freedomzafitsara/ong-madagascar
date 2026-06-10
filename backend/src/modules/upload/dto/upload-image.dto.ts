// backend/src/modules/upload/dto/upload-image.dto.ts
import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO pour l'upload d'un fichier
 */
export class UploadImageDto {
  @IsString()
  entityType: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isMain?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  displayOrder?: number;

  @IsOptional()
  @IsString()
  altTextFr?: string;

  @IsOptional()
  @IsString()
  altTextMg?: string;
}

/**
 * DTO pour la mise à jour des textes alternatifs d'une image
 */
export class UpdateImageAltDto {
  @IsOptional()
  @IsString()
  altTextFr?: string;

  @IsOptional()
  @IsString()
  altTextMg?: string;
}

/**
 * DTO pour la réorganisation des images
 */
export class ReorderImagesDto {
  @IsString({ each: true })
  imageIds: string[];
}

/**
 * DTO de réponse pour une image
 */
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
}

/**
 * DTO de réponse pour l'upload
 */
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
}

/**
 * DTO de réponse pour la liste des images
 */
export class ImagesListResponseDto {
  success: boolean;
  images: ImageResponseDto[];
}

/**
 * DTO de réponse pour la suppression
 */
export class DeleteResponseDto {
  success: boolean;
  message: string;
}