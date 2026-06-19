// backend/src/modules/pages/dto/create-page-content.dto.ts

import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsArray, 
  IsObject, 
  ValidateNested, 
  IsNumber, 
  Min, 
  Max,
  IsIn,
  IsUUID,
  IsUrl,
  IsNotEmpty,
  Length,
  IsInt
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

// ============================================================
// TYPES
// ============================================================

export type PageType = 
  | 'home'
  | 'projects'
  | 'jobs'
  | 'blog'
  | 'contact'
  | 'login'
  | 'dashboard'
  | 'profile'
  | 'about'
  | 'faq';

// ============================================================
// HERO DTO
// ============================================================

export class HeroDto {
  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Le titre ne doit pas depasser 255 caracteres' })
  title_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Le titre ne doit pas depasser 255 caracteres' })
  title_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Le sous-titre ne doit pas depasser 500 caracteres' })
  subtitle_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Le sous-titre ne doit pas depasser 500 caracteres' })
  subtitle_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Le texte du bouton ne doit pas depasser 100 caracteres' })
  button_text_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Le texte du bouton ne doit pas depasser 100 caracteres' })
  button_text_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Le lien du bouton ne doit pas depasser 255 caracteres' })
  button_link?: string;

  @IsOptional()
  @IsUrl({ 
    require_tld: false,
    protocols: ['http', 'https'],
  }, { 
    message: 'L\'URL de l\'image doit etre valide' 
  })
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// ============================================================
// SECTION DTO
// ============================================================

export class SectionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Le titre ne doit pas depasser 255 caracteres' })
  title_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Le titre ne doit pas depasser 255 caracteres' })
  title_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000, { message: 'La description ne doit pas depasser 2000 caracteres' })
  description_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000, { message: 'La description ne doit pas depasser 2000 caracteres' })
  description_mg?: string;

  @IsOptional()
  @IsUrl({ 
    require_tld: false,
    protocols: ['http', 'https'],
  }, { 
    message: 'L\'URL de l\'image doit etre valide' 
  })
  image_url?: string;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'L\'ordre doit etre superieur ou egal a 0' })
  order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Le texte du bouton ne doit pas depasser 100 caracteres' })
  button_text_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Le texte du bouton ne doit pas depasser 100 caracteres' })
  button_text_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Le lien du bouton ne doit pas depasser 255 caracteres' })
  button_link?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50, { message: 'La couleur ne doit pas depasser 50 caracteres' })
  background_color?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50, { message: 'La classe CSS ne doit pas depasser 50 caracteres' })
  css_class?: string;
}

// ============================================================
// STAT DTO
// ============================================================

export class StatDto {
  @IsString()
  @IsNotEmpty({ message: 'La valeur de la statistique est requise' })
  value: string;

  @IsString()
  @IsNotEmpty({ message: 'Le libelle en francais est requis' })
  @Length(0, 255, { message: 'Le libelle ne doit pas depasser 255 caracteres' })
  label_fr: string;

  @IsString()
  @IsNotEmpty({ message: 'Le libelle en malgache est requis' })
  @Length(0, 255, { message: 'Le libelle ne doit pas depasser 255 caracteres' })
  label_mg: string;

  @IsOptional()
  @IsString()
  @Length(0, 50, { message: 'Le nom de l\'icone ne doit pas depasser 50 caracteres' })
  icon?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50, { message: 'La couleur ne doit pas depasser 50 caracteres' })
  color?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Le suffixe ne doit pas depasser 255 caracteres' })
  suffix?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Le prefixe ne doit pas depasser 255 caracteres' })
  prefix?: string;
}

// ============================================================
// CTA DTO
// ============================================================

export class CtaDto {
  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Le titre ne doit pas depasser 255 caracteres' })
  title_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Le titre ne doit pas depasser 255 caracteres' })
  title_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'La description ne doit pas depasser 500 caracteres' })
  description_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'La description ne doit pas depasser 500 caracteres' })
  description_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Le texte du bouton ne doit pas depasser 100 caracteres' })
  button_text_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Le texte du bouton ne doit pas depasser 100 caracteres' })
  button_text_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Le lien du bouton ne doit pas depasser 255 caracteres' })
  button_link?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50, { message: 'La couleur de fond ne doit pas depasser 50 caracteres' })
  background_color?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50, { message: 'La couleur du texte ne doit pas depasser 50 caracteres' })
  text_color?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// ============================================================
// SEO DTO
// ============================================================

export class SeoDto {
  @IsOptional()
  @IsString()
  @Length(0, 70, { message: 'Le titre SEO ne doit pas depasser 70 caracteres' })
  seo_title_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 70, { message: 'Le titre SEO ne doit pas depasser 70 caracteres' })
  seo_title_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 160, { message: 'La description SEO ne doit pas depasser 160 caracteres' })
  seo_description_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 160, { message: 'La description SEO ne doit pas depasser 160 caracteres' })
  seo_description_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Les mots-cles SEO ne doivent pas depasser 255 caracteres' })
  seo_keywords?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Le slug ne doit pas depasser 255 caracteres' })
  slug?: string;

  @IsOptional()
  @IsBoolean()
  no_index?: boolean;

  @IsOptional()
  @IsBoolean()
  no_follow?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'L\'URL canonique ne doit pas depasser 255 caracteres' })
  canonical_url?: string;
}

// ============================================================
// DTO PRINCIPAL - CREATION
// ============================================================

export class CreatePageContentDto {
  @IsString()
  @IsIn(['home', 'projects', 'jobs', 'blog', 'contact', 'login', 'dashboard', 'profile', 'about', 'faq'], {
    message: 'La clé de page doit être valide (home, projects, jobs, blog, contact, login, dashboard, profile, about, faq)'
  })
  page_key: string;

  @IsOptional()
  @IsString()
  @Length(0, 5000, { message: 'Le contenu ne doit pas depasser 5000 caracteres' })
  content_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 5000, { message: 'Le contenu ne doit pas depasser 5000 caracteres' })
  content_mg?: string;

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
  @IsObject()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;

  // ✅ CHAMPS SEO PLATS (pour compatibilite avec l'ancienne version)
  @IsOptional()
  @IsString()
  @Length(0, 70, { message: 'Le titre SEO ne doit pas depasser 70 caracteres' })
  seo_title_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 70, { message: 'Le titre SEO ne doit pas depasser 70 caracteres' })
  seo_title_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 160, { message: 'La description SEO ne doit pas depasser 160 caracteres' })
  seo_description_fr?: string;

  @IsOptional()
  @IsString()
  @Length(0, 160, { message: 'La description SEO ne doit pas depasser 160 caracteres' })
  seo_description_mg?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Les mots-cles SEO ne doivent pas depasser 255 caracteres' })
  seo_keywords?: string;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, any>;

  @IsOptional()
  @IsUUID(4, { message: 'L\'ID de l\'utilisateur doit être un UUID valide' })
  updated_by?: string;
}

// ============================================================
// DTO DE MISE A JOUR (PARTIEL)
// ============================================================

export class UpdatePageContentDto extends PartialType(CreatePageContentDto) {}

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
}

// ============================================================
// DTO DE PUBLICATION
// ============================================================

export class PublishPageDto {
  @IsBoolean()
  is_published: boolean;

  @IsOptional()
  @IsUUID(4, { message: 'L\'ID de l\'utilisateur doit être un UUID valide' })
  updated_by?: string;
}

// ============================================================
// DTO DE RECHERCHE / FILTRE
// ============================================================

export class PageFilterDto {
  @IsOptional()
  @IsString()
  @IsIn(['home', 'projects', 'jobs', 'blog', 'contact', 'login', 'dashboard', 'profile', 'about', 'faq'])
  page_key?: string;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}