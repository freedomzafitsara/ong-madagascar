// backend/src/modules/jobs/dto/create-job-offer.dto.ts

import { IsString, IsOptional, IsBoolean, IsDateString, MaxLength } from 'class-validator';

export class CreateJobOfferDto {
  @IsString()
  @MaxLength(255)
  title_fr: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title_mg?: string;

  @IsString()
  description_fr: string;

  @IsString()
  @IsOptional()
  description_mg?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  contract_type?: string;

  @IsDateString()
  @IsOptional()
  deadline?: Date;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @IsString()
  @IsOptional()
  image_url?: string;
}

export class UpdateJobOfferDto {
  @IsString()
  @IsOptional()
  title_fr?: string;

  @IsString()
  @IsOptional()
  title_mg?: string;

  @IsString()
  @IsOptional()
  description_fr?: string;

  @IsString()
  @IsOptional()
  description_mg?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  contract_type?: string;

  @IsDateString()
  @IsOptional()
  deadline?: Date;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @IsString()
  @IsOptional()
  image_url?: string;
}

export class UpdateJobStatusDto {
  @IsBoolean()
  is_published: boolean;
}

export class JobOfferQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  status?: string;

  @IsOptional()
  is_published?: boolean;

  @IsOptional()
  contract_type?: string;

  @IsOptional()
  search?: string;
}