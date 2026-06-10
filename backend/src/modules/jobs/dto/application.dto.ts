// backend/src/modules/jobs/dto/application.dto.ts

import { 
  IsUUID, 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsEnum, 
  IsInt, 
  Min, 
  Max,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ApplicationStatusEnum {
  SUBMITTED = 'submitted',
  REVIEWING = 'reviewing',
  SHORTLISTED = 'shortlisted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export class CreateJobApplicationDto {
  @IsUUID(4)
  @IsNotEmpty()
  job_offer_id: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  @Type(() => Number)
  experience_years?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  current_position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  current_company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cv_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  cover_letter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cover_letter_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  photo_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkedin_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  portfolio_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  diploma_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  attestation_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  experience?: string;
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatusEnum)
  @IsNotEmpty()
  status: ApplicationStatusEnum;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class ApplicationQueryDto {
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
  @IsEnum(ApplicationStatusEnum)
  status?: ApplicationStatusEnum;

  @IsOptional()
  @IsUUID()
  job_offer_id?: string;

  @IsOptional()
  @IsString()
  search?: string;
}