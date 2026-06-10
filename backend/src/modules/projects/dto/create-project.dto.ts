// backend/src/modules/projects/dto/create-project.dto.ts

import { 
  IsString, 
  IsOptional, 
  IsDateString, 
  MaxLength, 
  MinLength, 
  IsNotEmpty, 
  IsIn, 
  IsNumber, 
  Min, 
  Max,
  IsBoolean, 
  IsInt 
} from 'class-validator';
import { Type } from 'class-transformer';

const VALID_STATUSES = ['active', 'completed', 'planning', 'draft'] as const;

// ============================================================
// CREATE PROJECT DTO
// ============================================================

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre français est requis' })
  @MinLength(5, { message: 'Le titre doit contenir au moins 5 caractères' })
  @MaxLength(255, { message: 'Le titre ne doit pas dépasser 255 caractères' })
  title_fr: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Le titre malgache ne doit pas dépasser 255 caractères' })
  title_mg?: string;

  @IsString()
  @IsNotEmpty({ message: 'La description française est requise' })
  @MinLength(20, { message: 'La description doit contenir au moins 20 caractères' })
  @MaxLength(5000, { message: 'La description ne doit pas dépasser 5000 caractères' })
  description_fr: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000, { message: 'La description malgache ne doit pas dépasser 5000 caractères' })
  description_mg?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'La localisation ne doit pas dépasser 255 caractères' })
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'La région ne doit pas dépasser 100 caractères' })
  region?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  budget?: number = 0;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  spent?: number = 0;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  beneficiaries_count?: number = 0;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  youth_impact?: number = 0;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  jobs_created?: number = 0;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  progress?: number = 0;

  @IsDateString({}, { message: 'La date de début doit être une date valide (YYYY-MM-DD)' })
  @IsOptional()
  start_date?: string;

  @IsDateString({}, { message: 'La date de fin doit être une date valide (YYYY-MM-DD)' })
  @IsOptional()
  end_date?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  is_featured?: boolean = false;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'L\'URL de l\'image ne doit pas dépasser 500 caractères' })
  image_url?: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_STATUSES, { message: 'Le statut doit être: active, completed, planning ou draft' })
  status?: string = 'planning';
}

// ============================================================
// UPDATE PROJECT DTO
// ============================================================

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  @MinLength(5, { message: 'Le titre doit contenir au moins 5 caractères' })
  @MaxLength(255, { message: 'Le titre ne doit pas dépasser 255 caractères' })
  title_fr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Le titre malgache ne doit pas dépasser 255 caractères' })
  title_mg?: string;

  @IsString()
  @IsOptional()
  @MinLength(20, { message: 'La description doit contenir au moins 20 caractères' })
  @MaxLength(5000, { message: 'La description ne doit pas dépasser 5000 caractères' })
  description_fr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000, { message: 'La description malgache ne doit pas dépasser 5000 caractères' })
  description_mg?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'La localisation ne doit pas dépasser 255 caractères' })
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'La région ne doit pas dépasser 100 caractères' })
  region?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  budget?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  spent?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  beneficiaries_count?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  youth_impact?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  jobs_created?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  progress?: number;

  @IsDateString({}, { message: 'La date de début doit être une date valide (YYYY-MM-DD)' })
  @IsOptional()
  start_date?: string;

  @IsDateString({}, { message: 'La date de fin doit être une date valide (YYYY-MM-DD)' })
  @IsOptional()
  end_date?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  is_featured?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'L\'URL de l\'image ne doit pas dépasser 500 caractères' })
  image_url?: string;

  @IsString()
  @IsOptional()
  @IsIn(VALID_STATUSES, { message: 'Le statut doit être: active, completed, planning ou draft' })
  status?: string;
}

// ============================================================
// PROJECT QUERY DTO
// ============================================================

export class ProjectQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La page doit être un nombre' })
  @Min(1, { message: 'La page doit être au moins 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La limite doit être un nombre' })
  @Min(1, { message: 'La limite doit être au moins 1' })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(VALID_STATUSES, { message: 'Le statut doit être: active, completed, planning ou draft' })
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La recherche ne doit pas dépasser 100 caractères' })
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La région ne doit pas dépasser 100 caractères' })
  region?: string;
}