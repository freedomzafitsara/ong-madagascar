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

export class CreatePageBackgroundDto {
  @IsString()
  @IsIn(['home', 'projects', 'jobs', 'blog', 'contact', 'login', 'dashboard', 'profile', 'about', 'faq'])
  page_key: string;

  @IsUrl({}, { message: 'L\'URL de l\'image doit etre valide' })
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
  @Min(0)
  @Max(100)
  overlay_opacity?: number;

  @IsOptional()
  @IsString()
  @IsIn(['center', 'top', 'bottom', 'left', 'right'])
  position?: string;

  @IsOptional()
  @IsUUID()
  updated_by?: string;
}

export class UpdatePageBackgroundDto extends PartialType(CreatePageBackgroundDto) {}