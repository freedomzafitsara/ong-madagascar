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
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

// ============================================================
// CREATE JOB OFFER DTO
// ============================================================

export class CreateJobOfferDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  title_fr: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title_mg?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(5000)
  description_fr: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description_mg?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  contract_type?: string;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  @IsDate()
  deadline?: Date;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
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
  @IsBoolean()
  @IsNotEmpty()
  is_published: boolean;
}

// ============================================================
// JOB OFFER QUERY DTO
// ============================================================

export class JobOfferQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsString()
  contract_type?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
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
}