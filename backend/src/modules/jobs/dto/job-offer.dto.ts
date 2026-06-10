// backend/src/modules/jobs/dto/job-offer.dto.ts

import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsDate, 
  IsUUID,
  MaxLength, 
  MinLength,
  IsNotEmpty,
  Min,
  Max,
  IsIn,
  IsUrl,
  IsInt
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';

// ============================================================
// CONSTANTES ET ENUMERATIONS
// ============================================================

export const CONTRACT_TYPES = ['CDI', 'CDD', 'STAGE', 'FREELANCE', 'ALTERNANCE', 'TEMPORARY'] as const;
export type ContractType = typeof CONTRACT_TYPES[number];

export const JOB_STATUSES = ['draft', 'published', 'closed', 'expired', 'archived'] as const;
export type JobStatus = typeof JOB_STATUSES[number];

// ============================================================
// CREATE JOB OFFER DTO
// ============================================================

// backend/src/modules/jobs/dto/job-offer.dto.ts

export class CreateJobOfferDto {
  @IsString()
  @IsNotEmpty()
  title_fr: string;

  @IsString()
  @IsNotEmpty()
  description_fr: string;

  @IsOptional()
  @IsString()
  title_mg?: string;

  @IsOptional()
  @IsString()
  description_mg?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  contract_type?: string;

  @IsOptional()
  @IsDate()
  deadline?: Date;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsString()
  image_url?: string;
}

// ============================================================
// UPDATE JOB OFFER DTO
// ============================================================

export class UpdateJobOfferDto extends PartialType(CreateJobOfferDto) {}

// ============================================================
// UPDATE JOB STATUS DTO
// ============================================================

export class UpdateJobStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(JOB_STATUSES)
  status: JobStatus;
}

// ============================================================
// JOB OFFER QUERY DTO
// ============================================================

export class JobOfferQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(JOB_STATUSES)
  status?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(CONTRACT_TYPES)
  contract_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'updated_at', 'deadline', 'title_fr', 'views_count', 'applications_count'])
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// ============================================================
// JOB OFFER RESPONSE DTO
// ============================================================

export class JobOfferResponseDto {
  id: string;
  title_fr: string;
  title_mg?: string;
  description_fr: string;
  description_mg?: string;
  company?: string;
  location?: string;
  contract_type?: string;
  deadline?: Date;
  is_published: boolean;
  image_url?: string;
  status: string;
  views_count: number;
  applications_count: number;
  created_at: Date;
  updated_at: Date;
  days_until_deadline?: number;
  is_expired?: boolean;
  main_image_id?: string;
}

// ============================================================
// JOB OFFER STATS DTO
// ============================================================

export class JobOfferStatsDto {
  total: number;
  published: number;
  draft: number;
  expired: number;
  closed: number;
  archived: number;
  total_views: number;
  total_applications: number;
  conversion_rate?: number;
  contracts_by_type?: Record<string, number>;
  locations?: Record<string, number>;
}