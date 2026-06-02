// backend/src/modules/jobs/dto/create-job-application.dto.ts

import { 
  IsUUID, 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsInt, 
  Min, 
  Max, 
  IsEnum, 
  IsNotEmpty,
  MaxLength,
  MinLength
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

// Statuts des candidatures (simplifiés)
export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  REVIEWING = 'reviewing',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

// ============================================================
// CREATE JOB APPLICATION DTO
// ============================================================

export class CreateJobApplicationDto {
  @IsUUID()
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
  @MinLength(9)
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  experience_years?: number;

  @IsOptional()
  @IsString()
  cover_letter?: string;

  // URLs des documents (upload)
  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsOptional()
  @IsString()
  cv_url?: string;

  @IsOptional()
  @IsString()
  diploma_url?: string;

  @IsOptional()
  @IsString()
  attestation_url?: string;
}

// ============================================================
// UPDATE JOB APPLICATION DTO
// ============================================================

export class UpdateJobApplicationDto extends PartialType(CreateJobApplicationDto) {}

// ============================================================
// UPDATE APPLICATION STATUS DTO
// ============================================================

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================================
// JOB APPLICATION QUERY DTO
// ============================================================

export class JobApplicationQueryDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsUUID()
  job_offer_id?: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// ============================================================
// JOB APPLICATION RESPONSE DTO
// ============================================================

export class JobApplicationResponseDto {
  id: string;
  job_offer_id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  experience?: string;
  experience_years?: number;
  cover_letter?: string;
  photo_url?: string;
  cv_url?: string;
  diploma_url?: string;
  attestation_url?: string;
  status: string;
  notes?: string;
  reviewed_by?: string;
  reviewed_at?: Date;
  created_at: Date;
  updated_at: Date;
}