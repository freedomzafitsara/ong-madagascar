// backend/src/modules/upload/dto/upload-image.dto.ts

import { IsString, IsOptional, IsBoolean, IsInt, Min, Max, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

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

export class UpdateImageAltDto {
  @IsOptional()
  @IsString()
  altTextFr?: string;

  @IsOptional()
  @IsString()
  altTextMg?: string;
}

export class ReorderImagesDto {
  @IsString({ each: true })
  imageIds: string[];
}

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

export class ImagesListResponseDto {
  success: boolean;
  images: ImageResponseDto[];
}

export class DeleteResponseDto {
  success: boolean;
  message: string;
}