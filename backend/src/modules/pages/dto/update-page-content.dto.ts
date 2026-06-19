// backend/src/modules/pages/dto/update-page-content.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreatePageContentDto } from './create-page-content.dto';
import { 
  IsOptional, 
  IsString, 
  IsUUID, 
  IsBoolean, 
  IsObject,
  IsNumber,
  Min,
  Max,
  Length,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { HeroDto, SectionDto, StatDto, CtaDto } from './create-page-content.dto';

// ============================================================
// DTO DE PUBLICATION
// ============================================================

export class PublishPageDto {
  @IsBoolean()
  is_published: boolean;

  @IsOptional()
  @IsUUID(4, { message: 'L\'ID de l\'utilisateur doit être un UUID valide' })
  updated_by?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Le message ne doit pas dépasser 255 caractères' })
  message?: string;
}

// ============================================================
// DTO DE MISE A JOUR DU CONTENU
// ============================================================

export class UpdatePageContentDto extends PartialType(CreatePageContentDto) {
  @IsOptional()
  @IsUUID(4, { message: 'L\'ID de l\'utilisateur doit être un UUID valide' })
  updated_by?: string;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 5000, { message: 'Le contenu ne doit pas dépasser 5000 caractères' })
  content_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 5000, { message: 'Le contenu ne doit pas dépasser 5000 caractères' })
  content_mg?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HeroDto)
  hero?: HeroDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HeroDto)
  hero_update?: HeroDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CtaDto)
  cta?: CtaDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CtaDto)
  cta_update?: CtaDto;

  @IsOptional()
  @IsString()
  @Length(0, 70, { message: 'Le titre SEO ne doit pas dépasser 70 caractères' })
  seo_title_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 70, { message: 'Le titre SEO ne doit pas dépasser 70 caractères' })
  seo_title_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 160, { message: 'La description SEO ne doit pas dépasser 160 caractères' })
  seo_description_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 160, { message: 'La description SEO ne doit pas dépasser 160 caractères' })
  seo_description_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Les mots-clés SEO ne doivent pas dépasser 255 caractères' })
  seo_keywords?: string;

  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, any>;

  @IsOptional()
  @IsObject()
  custom_fields_update?: Record<string, any>;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  version?: number;
}

// ============================================================
// DTO DE REPONSE
// ============================================================

export class PageContentResponseDto {
  id: string;
  page_key: string;
  content_fr?: string;
  content_mg?: string;
  hero?: HeroDto;
  sections?: SectionDto[];
  stats?: StatDto[];
  cta?: CtaDto;
  seo_title_fr?: string;
  seo_title_mg?: string;
  seo_description_fr?: string;
  seo_description_mg?: string;
  seo_keywords?: string;
  is_published: boolean;
  custom_fields?: Record<string, any>;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
  version: number;
}

// ============================================================
// DTO D'HISTORIQUE DES MODIFICATIONS
// ============================================================

export class PageContentHistoryDto {
  id: string;
  page_key: string;
  content_fr?: string;
  content_mg?: string;
  updated_by?: string;
  updated_at: Date;
  version: number;
  change_type: 'create' | 'update' | 'publish' | 'unpublish';
  change_summary?: string;
}

// ============================================================
// DTO DE FILTRE / RECHERCHE
// ============================================================

export class PageContentFilterDto {
  @IsOptional()
  @IsString()
  page_key?: string;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  sort_by?: 'created_at' | 'updated_at' | 'page_key';

  @IsOptional()
  @IsString()
  sort_order?: 'ASC' | 'DESC';
}

// ============================================================
// DTO DE BULK UPDATE (MISE A JOUR MULTIPLE)
// ============================================================

export class BulkUpdatePageContentDto {
  @IsString()
  @Length(0, 255, { message: 'La clé de page ne doit pas dépasser 255 caractères' })
  page_key: string;

  @IsOptional()
  @IsString()
  @Length(0, 5000, { message: 'Le contenu ne doit pas dépasser 5000 caractères' })
  content_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 5000, { message: 'Le contenu ne doit pas dépasser 5000 caractères' })
  content_mg?: string;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsObject()
  hero?: HeroDto;

  @IsOptional()
  @IsObject()
  cta?: CtaDto;
}