// backend/src/modules/pages/dto/create-page-background.dto.ts

import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsNumber, 
  Min, 
  Max, 
  IsIn,
  IsUrl,
  IsUUID
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// ============================================================
// TYPES
// ============================================================

export type PageKey = 
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
// DTO DE CREATION
// ============================================================

export class CreatePageBackgroundDto {
  @IsString()
  @IsIn(['home', 'projects', 'jobs', 'blog', 'contact', 'login', 'dashboard', 'profile', 'about', 'faq'], {
    message: 'La clé de page doit être valide (home, projects, jobs, blog, contact, login, dashboard, profile, about, faq)'
  })
  page_key: string;

  @IsUrl({ 
    require_tld: false,
    protocols: ['http', 'https'],
  }, { 
    message: 'L\'URL de l\'image doit être valide' 
  })
  image_url: string;

  @IsOptional()
  @IsString()
  alt_fr?: string;

  @IsOptional()
  @IsString()
  alt_mg?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'L\'opacité doit être comprise entre 0 et 100' })
  @Max(100, { message: 'L\'opacité doit être comprise entre 0 et 100' })
  overlay_opacity?: number;

  @IsOptional()
  @IsString()
  @IsIn(['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'], {
    message: 'La position doit être: center, top, bottom, left, right, top-left, top-right, bottom-left, bottom-right'
  })
  position?: string;

  // ✅ AJOUT : Taille de l'image (cover, contain, fill, etc.)
  @IsOptional()
  @IsString()
  @IsIn(['cover', 'contain', 'fill', 'none', 'scale-down'], {
    message: 'La taille doit être: cover, contain, fill, none, scale-down'
  })
  size?: string;

  // ✅ AJOUT : Flou de l'image (0 = pas de flou)
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Le flou doit être compris entre 0 et 20' })
  @Max(20, { message: 'Le flou doit être compris entre 0 et 20' })
  blur?: number;

  // ✅ AJOUT : Luminosité de l'image (0 = noir, 100 = normal, 200 = plus clair)
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'La luminosité doit être comprise entre 0 et 200' })
  @Max(200, { message: 'La luminosité doit être comprise entre 0 et 200' })
  brightness?: number;

  @IsOptional()
  @IsUUID(4, { message: 'L\'ID de l\'utilisateur doit être un UUID valide' })
  updated_by?: string;
}

// ============================================================
// DTO DE MISE A JOUR (PARTIEL)
// ============================================================

export class UpdatePageBackgroundDto extends PartialType(CreatePageBackgroundDto) {}

// ============================================================
// DTO DE REPONSE
// ============================================================

export class PageBackgroundResponseDto {
  id: string;
  page_key: string;
  image_url: string;
  alt_fr?: string;
  alt_mg?: string;
  is_active: boolean;
  overlay_opacity: number;
  position: string;
  size: string;
  blur: number;
  brightness: number;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================
// DTO DE MISE A JOUR DE L'IMAGE UNIQUEMENT
// ============================================================

export class UpdateBackgroundImageDto {
  @IsUrl({ 
    require_tld: false,
    protocols: ['http', 'https'],
  }, { 
    message: 'L\'URL de l\'image doit être valide' 
  })
  image_url: string;
}

// ============================================================
// DTO DE TOGGLE (ACTIVATION/DESACTIVATION)
// ============================================================

export class ToggleBackgroundDto {
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}