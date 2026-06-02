// backend/src/modules/pages/dto/create-page-content.dto.ts

import { IsString, IsOptional, IsBoolean, IsArray, IsObject, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

// ============================================================
// HERO SECTION (avec structure FR/MG)
// ============================================================
class HeroDto {
  @IsOptional()
  @IsString()
  title_fr?: string;

  @IsOptional()
  @IsString()
  title_mg?: string;

  @IsOptional()
  @IsString()
  subtitle_fr?: string;

  @IsOptional()
  @IsString()
  subtitle_mg?: string;

  @IsOptional()
  @IsString()
  button_text_fr?: string;

  @IsOptional()
  @IsString()
  button_text_mg?: string;

  @IsOptional()
  @IsString()
  button_link?: string;

  @IsOptional()
  @IsString()
  image_url?: string;
}

// ============================================================
// SECTION DYNAMIQUE
// ============================================================
class SectionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  title_fr?: string;

  @IsOptional()
  @IsString()
  title_mg?: string;

  @IsOptional()
  @IsString()
  description_fr?: string;

  @IsOptional()
  @IsString()
  description_mg?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// ============================================================
// STATISTIQUES
// ============================================================
class StatDto {
  @IsString()
  value: string;

  @IsString()
  label_fr: string;

  @IsString()
  label_mg: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

// ============================================================
// CALL TO ACTION
// ============================================================
class CtaDto {
  @IsOptional()
  @IsString()
  title_fr?: string;

  @IsOptional()
  @IsString()
  title_mg?: string;

  @IsOptional()
  @IsString()
  description_fr?: string;

  @IsOptional()
  @IsString()
  description_mg?: string;

  @IsOptional()
  @IsString()
  button_text_fr?: string;

  @IsOptional()
  @IsString()
  button_text_mg?: string;

  @IsOptional()
  @IsString()
  button_link?: string;
}

// ============================================================
// CREATE PAGE CONTENT DTO
// ============================================================
export class CreatePageContentDto {
  @IsString()
  page: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HeroDto)
  hero?: HeroDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections?: SectionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatDto)
  stats?: StatDto[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CtaDto)
  cta?: CtaDto;

  @IsOptional()
  @IsString()
  seo_title_fr?: string;

  @IsOptional()
  @IsString()
  seo_title_mg?: string;

  @IsOptional()
  @IsString()
  seo_description_fr?: string;

  @IsOptional()
  @IsString()
  seo_description_mg?: string;

  @IsOptional()
  @IsString()
  seo_keywords?: string;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, any>;
}

// ============================================================
// UPDATE PAGE CONTENT DTO
// ============================================================
export class UpdatePageContentDto extends PartialType(CreatePageContentDto) {}