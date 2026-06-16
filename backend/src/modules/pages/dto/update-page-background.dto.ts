// backend/src/modules/pages/dto/update-page-background.dto.ts

import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePageBackgroundDto {
  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  overlay_opacity?: number;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  alt_fr?: string;

  @IsOptional()
  @IsString()
  alt_mg?: string;
}

export class CreatePageBackgroundDto {
  @IsString()
  page_key: string;

  @IsString()
  image_url: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  overlay_opacity?: number;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  alt_fr?: string;

  @IsOptional()
  @IsString()
  alt_mg?: string;
}